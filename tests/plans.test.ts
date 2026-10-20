import { beforeEach, describe, expect, it } from "vitest";

import {
  AiLimitExceededError,
  ContentLimitExceededError,
  assertCanCreateContent,
  getPlanConfig,
  reserveAiUsage,
  resolveEntitlements,
} from "../src/lib/plans";

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

describe("plan entitlements", () => {
  it("maps missing, inactive, canceled, and expired subscriptions to Free", () => {
    const plans = getPlanConfig();
    expect(resolveEntitlements().key).toBe("free");
    expect(resolveEntitlements({ planKey: "creator_pro", status: "inactive" }).key).toBe("free");
    expect(resolveEntitlements({ planKey: "team", status: "canceled" }).key).toBe("free");
    expect(resolveEntitlements({ planKey: "team", status: "active", currentPeriodEnd: new Date(Date.now() - 1) }).key).toBe("free");
    expect(plans.free.capabilities.collaboration).toBe(false);
  });

  it("grants only verified active paid subscriptions", () => {
    expect(resolveEntitlements({ planKey: "creator_pro", status: "active", currentPeriodEnd: new Date(Date.now() + 86_400_000) })).toMatchObject({
      key: "creator_pro",
      aiDailyLimit: 50,
      capabilities: { advancedAnalytics: true },
    });
    expect(resolveEntitlements({ planKey: "team", status: "trialing", currentPeriodEnd: new Date(Date.now() + 86_400_000) }).key).toBe("team");
    expect(resolveEntitlements({ planKey: "team", status: "active", currentPeriodEnd: new Date(Date.now() + 86_400_000) }).contentLimit).toBeNull();
  });

  it("never trusts an unsupported plan key or client cancellation flag", () => {
    expect(resolveEntitlements({ planKey: "team; DROP TABLE subscriptions", status: "active" }).key).toBe("free");
    expect(resolveEntitlements({ planKey: "creator_pro", status: "active", cancelAtPeriodEnd: true }).key).toBe("creator_pro");
  });

  it("rejects exhausted AI quota before inserting another reservation", async () => {
    let insertCalled = false;
    const tx = {
      execute: async () => ({ rows: [{ count: 5 }] }),
      insert: () => ({ values: async () => { insertCalled = true; } }),
    } as never;

    await expect(reserveAiUsage(tx, {
      workspaceId: "00000000-0000-0000-0000-000000000001",
      userId: "00000000-0000-0000-0000-000000000002",
      entitlement: getPlanConfig().free,
      featureKey: "idea_generation",
    })).rejects.toBeInstanceOf(AiLimitExceededError);
    expect(insertCalled).toBe(false);
  });

  it("enforces content limits without deleting existing content", async () => {
    const tx = {
      select: () => ({
        from: () => ({
          where: async () => [{ count: 50 }],
        }),
      }),
    } as never;

    await expect(assertCanCreateContent(tx, "00000000-0000-0000-0000-000000000001", getPlanConfig().free))
      .rejects.toBeInstanceOf(ContentLimitExceededError);
  });
});
