import { describe, expect, it } from "vitest";
import { parseServerEnv } from "../src/lib/env";

const validEnv = {
  NEXT_PUBLIC_APP_URL: "http://localhost:3000",
  NODE_ENV: "test",
  DATABASE_URL: "postgresql://user:password@localhost:5432/creator_grid",
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
};

describe("parseServerEnv", () => {
  it("accepts valid test-mode configuration and applies defaults", () => {
    expect(parseServerEnv(validEnv)).toMatchObject({
      NODE_ENV: "test",
      AI_DAILY_LIMIT_FREE: 5,
      MAX_UPLOAD_SIZE_BYTES: 10485760,
    });
  });

  it("reports missing variables by name without exposing values", () => {
    expect(() => parseServerEnv({ ...validEnv, DATABASE_URL: undefined })).toThrow("DATABASE_URL");
    expect(() => parseServerEnv({ ...validEnv, DATABASE_URL: undefined })).not.toThrow("password");
  });

  it("rejects malformed URLs, numeric limits, and live Stripe keys", () => {
    expect(() => parseServerEnv({ ...validEnv, NEXT_PUBLIC_APP_URL: "javascript:alert(1)" })).toThrow("NEXT_PUBLIC_APP_URL");
    expect(() => parseServerEnv({ ...validEnv, AI_DAILY_LIMIT_FREE: "0" })).toThrow("AI_DAILY_LIMIT_FREE");
    expect(() => parseServerEnv({ ...validEnv, STRIPE_SECRET_KEY: "sk_live_stripe" })).toThrow("STRIPE_SECRET_KEY");
  });
});
