import { NextResponse } from "next/server";
import { z } from "zod";

import { getDb } from "@/db";
import { requireApplicationUser } from "@/lib/auth";
import { requireWorkspaceMember, createWorkspaceAuthorizationStore } from "@/lib/authorization";
import { toApiErrorResponse } from "@/lib/api-errors";
import { createImageKitUploadAuth, validateAssetInput } from "@/lib/imagekit";
import { getPlanConfig } from "@/lib/plans";

const requestSchema = z.object({
  workspaceId: z.string().uuid(),
  mimeType: z.string().min(1).max(120),
  fileSizeBytes: z.number().int().positive(),
});

export async function POST(request: Request) {
  try {
    const user = await requireApplicationUser();
    const input = requestSchema.parse(await request.json());
    await requireWorkspaceMember(createWorkspaceAuthorizationStore(getDb()), user.id, input.workspaceId);
    validateAssetInput(input, getPlanConfig().free.maxUploadSizeBytes);

    return NextResponse.json({
      ...createImageKitUploadAuth(),
      folder: `creator-grid/${input.workspaceId}`,
    });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Invalid upload request" }, { status: 400 });
    if (error instanceof Error && (error.message.startsWith("Unsupported") || error.message.startsWith("Asset exceeds"))) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return toApiErrorResponse(error);
  }
}
