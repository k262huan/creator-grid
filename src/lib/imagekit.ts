import "server-only";

import { createHmac } from "node:crypto";

import { getServerEnv } from "@/lib/env";

export const ALLOWED_ASSET_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "audio/mpeg",
  "audio/wav",
  "audio/mp4",
  "application/pdf",
]);

export function validateAssetInput(input: { mimeType: string; fileSizeBytes: number }, maxUploadSizeBytes: number) {
  if (!ALLOWED_ASSET_MIME_TYPES.has(input.mimeType)) {
    throw new Error("Unsupported asset MIME type");
  }
  if (!Number.isSafeInteger(input.fileSizeBytes) || input.fileSizeBytes <= 0 || input.fileSizeBytes > maxUploadSizeBytes) {
    throw new Error("Asset exceeds the configured upload size limit");
  }
}

export function createImageKitUploadAuth(nowSeconds = Math.floor(Date.now() / 1000)) {
  const env = getServerEnv();
  const token = crypto.randomUUID();
  const expire = nowSeconds + 60 * 10;
  const signature = createHmac("sha1", env.IMAGEKIT_PRIVATE_KEY)
    .update(`${token}${expire}`)
    .digest("hex");

  return { token, expire, signature, publicKey: env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY };
}

export async function deleteImageKitFile(fileId: string): Promise<void> {
  const env = getServerEnv();
  const response = await fetch(`https://api.imagekit.io/v1/files/${encodeURIComponent(fileId)}`, {
    method: "DELETE",
    headers: { Authorization: `Basic ${Buffer.from(`${env.IMAGEKIT_PRIVATE_KEY}:`).toString("base64")}` },
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok && response.status !== 404) {
    throw new Error(`ImageKit deletion failed with status ${response.status}`);
  }
}
