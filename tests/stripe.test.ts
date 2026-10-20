import { beforeEach, describe, expect, it } from "vitest";

import { mapStripeSubscriptionStatus, normalizeStripeSubscription, parseBillablePlan, planKeyFromPriceId } from "@/lib/stripe";

beforeEach(() => {
  Object.assign(process.env, {
    NEXT_PUBLIC_APP_URL: "http://localhost:3000", NODE_ENV: "test", DATABASE_URL: "postgresql://user:password@localhost:5432/creator_grid?sslmode=require", NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk_test_clerk", CLERK_SECRET_KEY: "sk_test_clerk", CLERK_WEBHOOK_SECRET: "whsec_clerk", STRIPE_SECRET_KEY: "sk_test_stripe", STRIPE_WEBHOOK_SECRET: "whsec_stripe", NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: "pk_test_stripe", STRIPE_PRICE_CREATOR_PRO: "price_creator_pro", STRIPE_PRICE_TEAM: "price_team", NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY: "public_imagekit", IMAGEKIT_PRIVATE_KEY: "private_imagekit", NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT: "https://ik.imagekit.io/example", GEMINI_API_KEY: "gemini_key", AI_DAILY_LIMIT_FREE: "5", AI_DAILY_LIMIT_CREATOR_PRO: "50", AI_DAILY_LIMIT_TEAM: "200", MAX_UPLOAD_SIZE_BYTES: "10485760",
  });
});

describe("Stripe billing contracts", () => {
  it("accepts only configured paid plans and never treats Free as purchasable", () => {
    expect(parseBillablePlan("creator_pro")).toBe("creator_pro");
    expect(parseBillablePlan("team")).toBe("team");
    expect(() => parseBillablePlan("free")).toThrow("not purchasable");
    expect(() => parseBillablePlan("price_arbitrary")).toThrow("not purchasable");
    expect(planKeyFromPriceId("price_creator_pro")).toBe("creator_pro");
    expect(() => planKeyFromPriceId("price_client_supplied")).toThrow("not configured");
  });

  it("maps Stripe lifecycle states to the local entitlement states", () => {
    expect(mapStripeSubscriptionStatus("active")).toBe("active");
    expect(mapStripeSubscriptionStatus("trialing")).toBe("trialing");
    expect(mapStripeSubscriptionStatus("past_due")).toBe("past_due");
    expect(mapStripeSubscriptionStatus("canceled")).toBe("canceled");
    expect(mapStripeSubscriptionStatus("incomplete")).toBe("inactive");
  });

  it("normalizes verified subscription data without trusting client input", () => {
    const snapshot = normalizeStripeSubscription({
      id: "sub_test", status: "active", customer: "cus_test", cancel_at_period_end: false, metadata: { workspaceId: "00000000-0000-0000-0000-000000000001" },
      items: { data: [{ price: { id: "price_team" }, current_period_start: 1_700_000_000, current_period_end: 1_700_100_000 }] },
    } as never);
    expect(snapshot).toMatchObject({ stripeSubscriptionId: "sub_test", planKey: "team", status: "active", workspaceId: "00000000-0000-0000-0000-000000000001" });
    expect(snapshot.currentPeriodEnd).toEqual(new Date(1_700_100_000 * 1000));
  });
});
