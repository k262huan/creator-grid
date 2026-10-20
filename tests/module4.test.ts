import { readFileSync } from "node:fs";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createImageKitUploadAuth, isConfiguredImageKitUrl, validateAssetFileName, validateAssetInput } from "../src/lib/imagekit";
import { generateWithGemini } from "../src/lib/gemini";

beforeEach(() => {
  Object.assign(process.env, {
    NEXT_PUBLIC_APP_URL: "http://localhost:3000",
    NODE_ENV: "test",
    DATABASE_URL: "postgresql://user:password@localhost:5432/creator_grid?sslmode=require",
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk_test_clerk",
    CLERK_SECRET_KEY: "sk_test_clerk",
    CLERK_WEBHOOK_SECRET: "whsec_clerk",
    STRIPE_SECRET_KEY: "sk_test_stripe",
    STRIPE_WEBHOOK_SECRET: "whsec_stripe",
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: "pk_test_stripe",
    STRIPE_PRICE_CREATOR_PRO: "price_creator_pro",
    STRIPE_PRICE_TEAM: "price_team",
    NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY: "public_imagekit",
    IMAGEKIT_PRIVATE_KEY: "private_imagekit",
    NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT: "https://ik.imagekit.io/example",
    GEMINI_API_KEY: "gemini_key",
    AI_DAILY_LIMIT_FREE: "5",
    AI_DAILY_LIMIT_CREATOR_PRO: "50",
    AI_DAILY_LIMIT_TEAM: "200",
    MAX_UPLOAD_SIZE_BYTES: "10485760",
  });
});

describe("ImageKit boundary", () => {
  it("rejects unsupported MIME types and oversized files", () => {
    expect(() => validateAssetInput({ mimeType: "application/x-executable", fileSizeBytes: 10 }, 100)).toThrow("Unsupported");
    expect(() => validateAssetInput({ mimeType: "image/png", fileSizeBytes: 101 }, 100)).toThrow("upload size");
  });

  it("creates short-lived upload authorization without exposing the private key", () => {
    const auth = createImageKitUploadAuth(1_700_000_000);
    expect(auth).toMatchObject({ publicKey: "public_imagekit", expire: 1_700_000_600 });
    expect(auth.signature).toHaveLength(40);
    expect(JSON.stringify(auth)).not.toContain("private_imagekit");
  });

  it("accepts only URLs below the configured ImageKit endpoint and safe filenames", () => {
    expect(isConfiguredImageKitUrl("https://ik.imagekit.io/example/folder/file.png")).toBe(true);
    expect(isConfiguredImageKitUrl("https://ik.imagekit.io.evil.example/example/file.png")).toBe(false);
    expect(() => validateAssetFileName("../secret.txt")).toThrow("filename");
    expect(() => validateAssetFileName("safe-file.png")).not.toThrow();
  });
});

describe("Gemini boundary", () => {
  it("returns validated plain text and does not log or persist the prompt", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: "Editable suggestion" }] } }] }), { status: 200 })));
    await expect(generateWithGemini("idea_generation", "private prompt")).resolves.toBe("Editable suggestion");
    expect(vi.mocked(fetch).mock.calls[0]?.[1]).toBeDefined();
  });

  it("normalizes provider quota, rate-limit, and malformed responses", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}", { status: 429 })));
    await expect(generateWithGemini("text_refinement", "prompt")).rejects.toMatchObject({ kind: "rate_limit" });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ candidates: [] }), { status: 200 })));
    await expect(generateWithGemini("text_refinement", "prompt")).rejects.toMatchObject({ kind: "malformed" });
  });
});

describe("privacy data minimization", () => {
  it("does not store raw prompts in the AI route and exposes a public privacy notice", () => {
    const route = readFileSync("src/app/api/ai/generate/route.ts", "utf8");
    const privacy = readFileSync("src/app/privacy/page.tsx", "utf8");
    expect(route).not.toContain("console.log(input.prompt)");
    expect(route).not.toContain("rawPrompt:");
    expect(privacy).toContain("ImageKit");
    expect(privacy).toContain("Gemini");
    expect(privacy).toContain("export");
  });
});
