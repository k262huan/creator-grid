import "server-only";

import Stripe from "stripe";

import { getServerEnv } from "@/lib/env";
import { PLAN_KEYS, type PlanKey } from "@/lib/plans";

export const BILLABLE_PLAN_KEYS = ["creator_pro", "team"] as const;
export type BillablePlanKey = (typeof BILLABLE_PLAN_KEYS)[number];

let stripeClient: Stripe | undefined;

export function getStripeClient(): Stripe {
  const env = getServerEnv();
  if (!env.STRIPE_SECRET_KEY.startsWith("sk_test_")) throw new Error("Stripe must use a test-mode secret key");
  stripeClient ??= new Stripe(env.STRIPE_SECRET_KEY);
  return stripeClient;
}

export function getStripePriceId(planKey: string): string {
  const env = getServerEnv();
  if (planKey === "creator_pro") return env.STRIPE_PRICE_CREATOR_PRO;
  if (planKey === "team") return env.STRIPE_PRICE_TEAM;
  throw new Error("Plan is not purchasable");
}

export function parseBillablePlan(planKey: unknown): BillablePlanKey {
  if (planKey === "creator_pro" || planKey === "team") return planKey;
  throw new Error("Plan is not purchasable");
}

export function planKeyFromPriceId(priceId: string): BillablePlanKey {
  const env = getServerEnv();
  if (priceId === env.STRIPE_PRICE_CREATOR_PRO) return "creator_pro";
  if (priceId === env.STRIPE_PRICE_TEAM) return "team";
  throw new Error("Stripe price is not configured");
}

export function isKnownPlanKey(planKey: string): planKey is PlanKey {
  return PLAN_KEYS.includes(planKey as PlanKey);
}

export function mapStripeSubscriptionStatus(status: string): "inactive" | "trialing" | "active" | "past_due" | "canceled" | "unpaid" {
  if (status === "trialing") return "trialing";
  if (status === "active") return "active";
  if (status === "past_due") return "past_due";
  if (status === "canceled") return "canceled";
  if (status === "unpaid") return "unpaid";
  return "inactive";
}

export type SubscriptionSnapshot = {
  stripeSubscriptionId: string;
  stripeCustomerId: string | null;
  priceId: string;
  planKey: BillablePlanKey;
  status: ReturnType<typeof mapStripeSubscriptionStatus>;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  workspaceId?: string;
  userId?: string;
};

export function normalizeStripeSubscription(subscription: Stripe.Subscription): SubscriptionSnapshot {
  const item = subscription.items.data[0];
  const priceId = item?.price.id;
  if (!priceId) throw new Error("Stripe subscription has no price");
  return {
    stripeSubscriptionId: subscription.id,
    stripeCustomerId: typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id,
    priceId,
    planKey: planKeyFromPriceId(priceId),
    status: mapStripeSubscriptionStatus(subscription.status),
    currentPeriodStart: item.current_period_start ? new Date(item.current_period_start * 1000) : null,
    currentPeriodEnd: item.current_period_end ? new Date(item.current_period_end * 1000) : null,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    workspaceId: subscription.metadata.workspaceId,
    userId: subscription.metadata.userId,
  };
}

export function checkoutOrigin(): string {
  return getServerEnv().NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
}
