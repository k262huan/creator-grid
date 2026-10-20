import { and, count, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getDb } from "@/db";
import { assets, contentAssets, workspaceMembers } from "@/db/schema";
import { toApiErrorResponse } from "@/lib/api-errors";
import { requireApplicationUser } from "@/lib/auth";
import { createWorkspaceAuthorizationStore, requireAssetAccess } from "@/lib/authorization";
import { deleteImageKitFile } from "@/lib/imagekit";

export async function DELETE(_request: Request, context: { params: Promise<{ assetId: string }> }) {
  try {
    const user = await requireApplicationUser();
    const assetId = z.string().uuid().parse((await context.params).assetId);
    const db = getDb();
    const access = await requireAssetAccess(createWorkspaceAuthorizationStore(db), user.id, assetId);
    const [membership] = await db.select({ role: workspaceMembers.role }).from(workspaceMembers)
      .where(and(eq(workspaceMembers.workspaceId, access.workspaceId), eq(workspaceMembers.userId, user.id))).limit(1);
    if (membership?.role !== "owner") return NextResponse.json({ error: "Owner permission required" }, { status: 403 });

    const [referenceCount] = await db.select({ count: count() }).from(contentAssets).where(eq(contentAssets.assetId, assetId));
    if ((referenceCount?.count ?? 0) > 0) {
      return NextResponse.json({ error: "Remove all content associations before deleting this asset" }, { status: 409 });
    }

    const [asset] = await db.select().from(assets).where(eq(assets.id, assetId)).limit(1);
    if (!asset) return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    await deleteImageKitFile(asset.imagekitFileId);
    await db.delete(assets).where(eq(assets.id, assetId));
    return NextResponse.json({ deleted: true });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Invalid asset ID" }, { status: 400 });
    return toApiErrorResponse(error);
  }
}
