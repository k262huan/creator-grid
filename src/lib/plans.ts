import "server-only";

import { sql } from "drizzle-orm";

import { aiUsageEvents, contentItems } from "@/db/schema";
import type { AuthorizedTransaction } from "@/db/authorized";
import { getServerEnv } from "@/lib/env";

export const PLAN_KEYS = ["free", "creator_pro", "team"] as const;
export type PlanKey = (typeof PLAN_KEYS)[number];
export type SubscriptionStatus = "inactive" | "trialing" | "active" | "past_due" | "canceled" | "unpaid";

export type PlanEntitlements = {
  key: PlanKey;
  displayName: string;
  monthlyPrice: string;
  billingInterval: "month";
  contentLimit: number | null;
  aiDailyLimit: number;
  maxUploadSizeBytes: number;
  capabilities: {
    collaboration: boolean;
    clientReview: boolean;
    advancedAnalytics: boolean;
  };
};

export type VerifiedSubscription = {
  planKey: string;
  status: string;
  cancelAtPeriodEnd?: boolean;
  currentPeriodEnd?: Date | null;
};

function publicPlanConfig(): Record<PlanKey, PlanEntitlements> {
  return {
    free: { key: "free", displayName: "Free", monthlyPrice: "0", billingInterval: "month", contentLimit: 50, aiDailyLimit: 5, maxUploadSizeBytes: 10 * 1024 * 1024, capabilities: { collaboration: false, clientReview: false, advancedAnalytics: false } },
    creator_pro: { key: "creator_pro", displayName: "Creator Pro", monthlyPrice: process.env.CREATOR_PRO_MONTHLY_PRICE ?? "19", billingInterval: "month", contentLimit: 500, aiDailyLimit: 50, maxUploadSizeBytes: 10 * 1024 * 1024, capabilities: { collaboration: false, clientReview: false, advancedAnalytics: true } },
    team: { key: "team", displayName: "Team", monthlyPrice: process.env.TEAM_MONTHLY_PRICE ?? "49", billingInterval: "month", contentLimit: null, aiDailyLimit: 200, maxUploadSizeBytes: 10 * 1024 * 1024, capabilities: { collaboration: true, clientReview: true, advancedAnalytics: true } },
  };
}

export function getPublicPlanConfig(): Record<PlanKey, PlanEntitlements> {
  return publicPlanConfig();
}

function positiveLimit(value: string | undefined, fallback: number): number {
  const parsed = Number(value ?? fallback);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export function getPlanConfig(): Record<PlanKey, PlanEntitlements> {
  const env = getServerEnv();
  const plans = publicPlanConfig();
  return {
    free: { ...plans.free, contentLimit: positiveLimit(process.env.CONTENT_LIMIT_FREE, 50), aiDailyLimit: env.AI_DAILY_LIMIT_FREE, maxUploadSizeBytes: env.MAX_UPLOAD_SIZE_BYTES },
    creator_pro: { ...plans.creator_pro, contentLimit: positiveLimit(process.env.CONTENT_LIMIT_CREATOR_PRO, 500), aiDailyLimit: env.AI_DAILY_LIMIT_CREATOR_PRO, maxUploadSizeBytes: env.MAX_UPLOAD_SIZE_BYTES },
    team: { ...plans.team, aiDailyLimit: env.AI_DAILY_LIMIT_TEAM, maxUploadSizeBytes: env.MAX_UPLOAD_SIZE_BYTES },
  };
}

export function resolveEntitlements(subscription?: VerifiedSubscription | null): PlanEntitlements {
  const plans = getPlanConfig();
  if (!subscription) return plans.free;

  const planKey = PLAN_KEYS.includes(subscription.planKey as PlanKey)
    ? (subscription.planKey as PlanKey)
    : "free";
  const isPaidStatus = subscription.status === "active" || subscription.status === "trialing";
  const periodExpired = subscription.currentPeriodEnd ? subscription.currentPeriodEnd.getTime() <= Date.now() : false;

  if (planKey === "free" || !isPaidStatus || periodExpired) {
    return plans.free;
  }

  return plans[planKey];
}

export class AiLimitExceededError extends Error {
  readonly status = 429 as const;

  constructor(public readonly limit: number) {
    super("Daily AI usage limit reached");
    this.name = "AiLimitExceededError";
  }
}

export class ContentLimitExceededError extends Error {
  readonly status = 403 as const;

  constructor(public readonly limit: number) {
    super("Content limit reached for the current plan");
    this.name = "ContentLimitExceededError";
  }
}

export async function assertCanCreateContent(
  tx: AuthorizedTransaction,
  workspaceId: string,
  entitlement: PlanEntitlements,
): Promise<void> {
  if (entitlement.contentLimit === null) return;

  const result = await tx
    .select({ count: sql<number>`count(*)::int` })
    .from(contentItems)
    .where(sql`${contentItems.workspaceId} = ${workspaceId}::uuid and ${contentItems.status} <> 'archived'`);

  if ((result[0]?.count ?? 0) >= entitlement.contentLimit) {
    throw new ContentLimitExceededError(entitlement.contentLimit);
  }
}

export async function reserveAiUsage(
  tx: AuthorizedTransaction,
  input: {
    workspaceId: string;
    userId: string;
    entitlement: PlanEntitlements;
    featureKey: string;
    provider?: string;
    model?: string;
  },
): Promise<string> {
  // Serialize reservations per workspace/day so concurrent requests cannot both
  // observe the same remaining quota and exceed the server-side limit.
  await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${`${input.workspaceId}:${new Date().toISOString().slice(0, 10)}`}))`);

  const usageResult = await tx.execute<{ count: number }>(sql`
    select count(*)::int as count
    from ${aiUsageEvents}
    where workspace_id = ${input.workspaceId}::uuid
      and created_at >= date_trunc('day', now())
      and status in ('started', 'succeeded')
  `);

  if ((usageResult.rows[0]?.count ?? 0) >= input.entitlement.aiDailyLimit) {
    throw new AiLimitExceededError(input.entitlement.aiDailyLimit);
  }

  const [event] = await tx.insert(aiUsageEvents).values({
    workspaceId: input.workspaceId,
    userId: input.userId,
    provider: input.provider ?? "gemini",
    model: input.model ?? "pending",
    featureKey: input.featureKey,
    status: "started",
  }).returning({ id: aiUsageEvents.id });
  return event.id;
}
