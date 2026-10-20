import { and, desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getDb } from "@/db";
import { assets, workspaceMembers } from "@/db/schema";
import { toApiErrorResponse } from "@/lib/api-errors";
import { requireApplicationUser } from "@/lib/auth";
import { createWorkspaceAuthorizationStore, requireWorkspaceMember } from "@/lib/authorization";
import { validateAssetInput } from "@/lib/imagekit";
import { getServerEnv } from "@/lib/env";
import { getPlanConfig } from "@/lib/plans";

const assetSchema = z.object({
  workspaceId: z.string().uuid(),
  imagekitFileId: z.string().trim().min(1).max(255),
  fileName: z.string().trim().min(1).max(255),
  fileUrl: z.string().url(),
  mimeType: z.string().min(1).max(120),
  fileSizeBytes: z.number().int().positive(),
});

export async function GET(request: Request) {
  try {
    const user = await requireApplicationUser();
    const workspaceId = new URL(request.url).searchParams.get("workspaceId");
    const parsedWorkspaceId = z.string().uuid().parse(workspaceId);
    await requireWorkspaceMember(createWorkspaceAuthorizationStore(getDb()), user.id, parsedWorkspaceId);

    const rows = await getDb().select({
      id: assets.id,
      workspaceId: assets.workspaceId,
      imagekitFileId: assets.imagekitFileId,
      fileName: assets.fileName,
      fileUrl: assets.fileUrl,
      mimeType: assets.mimeType,
      fileSizeBytes: assets.fileSizeBytes,
      createdAt: assets.createdAt,
    }).from(assets)
      .innerJoin(workspaceMembers, eq(workspaceMembers.workspaceId, assets.workspaceId))
      .where(and(eq(assets.workspaceId, parsedWorkspaceId), eq(workspaceMembers.userId, user.id)))
      .orderBy(desc(assets.createdAt));

    return NextResponse.json({ assets: rows });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Invalid workspace ID" }, { status: 400 });
    return toApiErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireApplicationUser();
    const input = assetSchema.parse(await request.json());
    const env = getServerEnv();
    if (!input.fileUrl.startsWith(env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT)) {
      return NextResponse.json({ error: "Asset URL is not from the configured ImageKit endpoint" }, { status: 400 });
    }
    validateAssetInput(input, getPlanConfig().free.maxUploadSizeBytes);
    await requireWorkspaceMember(createWorkspaceAuthorizationStore(getDb()), user.id, input.workspaceId);

    const [asset] = await getDb().insert(assets).values({
      workspaceId: input.workspaceId,
      uploadedByUserId: user.id,
      imagekitFileId: input.imagekitFileId,
      fileName: input.fileName,
      fileUrl: input.fileUrl,
      mimeType: input.mimeType,
      fileSizeBytes: input.fileSizeBytes,
    }).onConflictDoNothing({ target: [assets.workspaceId, assets.imagekitFileId] }).returning();

    if (asset) return NextResponse.json({ asset }, { status: 201 });
    const [existing] = await getDb().select().from(assets)
      .where(and(eq(assets.workspaceId, input.workspaceId), eq(assets.imagekitFileId, input.imagekitFileId))).limit(1);
    return NextResponse.json({ asset: existing, duplicate: true });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Invalid asset metadata" }, { status: 400 });
    if (error instanceof Error && (error.message.startsWith("Unsupported") || error.message.startsWith("Asset exceeds"))) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return toApiErrorResponse(error);
  }
}
