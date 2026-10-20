import { and, eq, inArray } from "drizzle-orm";
import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getDb } from "@/db";
import { assets, users, workspaceMembers, workspaces } from "@/db/schema";
import { toApiErrorResponse } from "@/lib/api-errors";
import { requireApplicationUser } from "@/lib/auth";
import { deleteImageKitFile } from "@/lib/imagekit";

const deleteSchema = z.object({ confirmation: z.literal("DELETE MY ACCOUNT") });

export async function POST(request: Request) {
  try {
    const user = await requireApplicationUser();
    const input = deleteSchema.parse(await request.json());
    const db = getDb();
    const ownedWorkspaces = await db.select({ id: workspaces.id }).from(workspaces).where(eq(workspaces.ownerUserId, user.id));
    const ownedIds = ownedWorkspaces.map((workspace) => workspace.id);
    if (ownedIds.length) {
      const otherMembers = await db.select({ workspaceId: workspaceMembers.workspaceId }).from(workspaceMembers)
        .where(and(inArray(workspaceMembers.workspaceId, ownedIds), eq(workspaceMembers.userId, user.id)));
      if (otherMembers.length !== ownedIds.length) {
        return NextResponse.json({ status: "blocked", error: "Workspace ownership must be resolved before account deletion" }, { status: 409 });
      }
      const allMembers = await db.select({ workspaceId: workspaceMembers.workspaceId, userId: workspaceMembers.userId })
        .from(workspaceMembers).where(inArray(workspaceMembers.workspaceId, ownedIds));
      if (allMembers.some((member) => member.userId !== user.id)) {
        return NextResponse.json({ status: "blocked", error: "A workspace has other members and cannot be silently transferred" }, { status: 409 });
      }
    }

    const userAssets = ownedIds.length ? await db.select({ fileId: assets.imagekitFileId }).from(assets).where(inArray(assets.workspaceId, ownedIds)) : [];
    for (const asset of userAssets) await deleteImageKitFile(asset.fileId);

    await db.delete(workspaces).where(and(eq(workspaces.ownerUserId, user.id), ownedIds.length ? inArray(workspaces.id, ownedIds) : eq(workspaces.id, "00000000-0000-0000-0000-000000000000")));
    await db.delete(users).where(eq(users.id, user.id));

    try {
      const client = await clerkClient();
      await client.users.deleteUser(user.clerkUserId);
    } catch {
      return NextResponse.json({ status: "database_deleted_provider_pending", error: "Application data was deleted, but identity-provider deletion requires follow-up" }, { status: 502 });
    }
    return NextResponse.json({ status: "completed" });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ status: "not_started", error: "Explicit confirmation is required" }, { status: 400 });
    return toApiErrorResponse(error);
  }
}
