import "server-only";
import { z } from "zod";

const positiveInteger = z.coerce.number().int().positive();

const serverEnvSchema = z
  .object({
    NEXT_PUBLIC_APP_URL: z.string().url().refine((value) => {
      const url = new URL(value);
      return !url.username && !url.password && (url.protocol === "https:" || url.hostname === "localhost" || url.hostname === "127.0.0.1");
    }, "NEXT_PUBLIC_APP_URL must be a trusted absolute HTTP(S) URL without credentials"),
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    DATABASE_URL: z.string().min(1),
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
    CLERK_SECRET_KEY: z.string().min(1),
    CLERK_WEBHOOK_SECRET: z.string().min(1),
    STRIPE_SECRET_KEY: z.string().min(1).refine((value) => value.startsWith("sk_test_"), "Stripe must use a test-mode secret key"),
    STRIPE_WEBHOOK_SECRET: z.string().min(1),
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1).refine((value) => value.startsWith("pk_test_"), "Stripe must use a test-mode publishable key"),
    STRIPE_PRICE_CREATOR_PRO: z.string().min(1),
    STRIPE_PRICE_TEAM: z.string().min(1),
    NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY: z.string().min(1),
    IMAGEKIT_PRIVATE_KEY: z.string().min(1),
    NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT: z.string().url(),
    GEMINI_API_KEY: z.string().min(1),
    AI_DAILY_LIMIT_FREE: positiveInteger.default(5),
    AI_DAILY_LIMIT_CREATOR_PRO: positiveInteger.default(50),
    AI_DAILY_LIMIT_TEAM: positiveInteger.default(200),
    MAX_UPLOAD_SIZE_BYTES: positiveInteger.default(10 * 1024 * 1024),
  })
  // `process.env` includes platform and test-runner variables outside the
  // application contract; validate known fields and ignore unrelated keys.
  .passthrough();

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function parseServerEnv(input: Record<string, unknown>): ServerEnv {
  const result = serverEnvSchema.safeParse(input);
  if (!result.success) {
    const missingOrInvalid = result.error.issues.map((issue) => issue.path.join(".") || "environment");
    throw new Error(`Invalid server environment configuration: ${missingOrInvalid.join(", ")}`);
  }
  return result.data;
}

let cachedEnv: ServerEnv | undefined;

export function getServerEnv(): ServerEnv {
  cachedEnv ??= parseServerEnv(process.env);
  return cachedEnv;
}
