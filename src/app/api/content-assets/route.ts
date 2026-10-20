import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getDb } from "@/db";
import { contentAssets } from "@/db/schema";
import { toApiErrorResponse } from "@/lib/api-errors";
import { requireApplicationUser } from "@/lib/auth";
import { createWorkspaceAuthorizationStore, requireContentAssetLinkAccess } from "@/lib/authorization";

const linkSchema = z.object({ contentItemId: z.string().uuid(), assetId: z.string().uuid() });

export async function POST(request: Request) {
  try {
    const user = await requireApplicationUser();
    const input = linkSchema.parse(await request.json());
    const access = await requireContentAssetLinkAccess(createWorkspaceAuthorizationStore(getDb()), user.id, input.contentItemId, input.assetId);
    const [link] = await getDb().insert(contentAssets).values({
      workspaceId: access.workspaceId,
      contentItemId: input.contentItemId,
      assetId: input.assetId,
    }).onConflictDoNothing({ target: [contentAssets.contentItemId, contentAssets.assetId] }).returning();
    if (!link) {
      const [existing] = await getDb().select().from(contentAssets).where(and(
        eq(contentAssets.contentItemId, input.contentItemId), eq(contentAssets.assetId, input.assetId),
      )).limit(1);
      return NextResponse.json({ link: existing, duplicate: true });
    }
    return NextResponse.json({ link }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Invalid content or asset ID" }, { status: 400 });
    return toApiErrorResponse(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await requireApplicationUser();
    const input = linkSchema.parse(await request.json());
    await requireContentAssetLinkAccess(createWorkspaceAuthorizationStore(getDb()), user.id, input.contentItemId, input.assetId);
    await getDb().delete(contentAssets).where(and(
      eq(contentAssets.contentItemId, input.contentItemId), eq(contentAssets.assetId, input.assetId),
    ));
    return NextResponse.json({ removed: true });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Invalid content or asset ID" }, { status: 400 });
    return toApiErrorResponse(error);
  }
}
