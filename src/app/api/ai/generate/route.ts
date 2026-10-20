import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { withAuthorizedTransaction } from "@/db/authorized";
import { getDb } from "@/db";
import { aiUsageEvents, subscriptions } from "@/db/schema";
import { toApiErrorResponse } from "@/lib/api-errors";
import { requireApplicationUser } from "@/lib/auth";
import { createWorkspaceAuthorizationStore, requireWorkspaceMember } from "@/lib/authorization";
import { GeminiProviderError, generateWithGemini, type GeminiAction } from "@/lib/gemini";
import { getPlanConfig, reserveAiUsage, resolveEntitlements } from "@/lib/plans";

const requestSchema = z.object({
  workspaceId: z.string().uuid(),
  action: z.enum(["idea_generation", "brief_drafting", "title_hook_suggestions", "caption_outline_drafting", "text_refinement"]),
  prompt: z.string().trim().min(1).max(4_000),
});

const requestTimestamps = new Map<string, number[]>();
const MAX_REQUESTS_PER_MINUTE = 10;

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const timestamps = (requestTimestamps.get(userId) ?? []).filter((time) => now - time < 60_000);
  if (timestamps.length >= MAX_REQUESTS_PER_MINUTE) {
    requestTimestamps.set(userId, timestamps);
    return false;
  }
  timestamps.push(now);
  requestTimestamps.set(userId, timestamps);
  return true;
}

function providerResponse(error: GeminiProviderError) {
  const status = error.kind === "rate_limit" || error.kind === "quota" ? 429 : error.kind === "timeout" ? 504 : 502;
  return NextResponse.json({ error: "AI provider request failed", code: error.kind }, { status });
}

export async function POST(request: Request) {
  try {
    const user = await requireApplicationUser();
    const input = requestSchema.parse(await request.json());
    await requireWorkspaceMember(createWorkspaceAuthorizationStore(getDb()), user.id, input.workspaceId);
    if (!checkRateLimit(user.id)) return NextResponse.json({ error: "AI rate limit exceeded" }, { status: 429 });

    const [subscription] = await getDb().select({
      planKey: subscriptions.planKey,
      status: subscriptions.status,
      currentPeriodEnd: subscriptions.currentPeriodEnd,
      cancelAtPeriodEnd: subscriptions.cancelAtPeriodEnd,
    }).from(subscriptions).where(eq(subscriptions.workspaceId, input.workspaceId)).orderBy(subscriptions.updatedAt).limit(1);
    const entitlement = resolveEntitlements(subscription);

    return await withAuthorizedTransaction(async (tx) => {
      const eventId = await reserveAiUsage(tx, {
        workspaceId: input.workspaceId,
        userId: user.id,
        entitlement,
        featureKey: input.action,
        model: "gemini-2.0-flash",
      });

      try {
        const generatedText = await generateWithGemini(input.action as GeminiAction, input.prompt);
        await tx.update(aiUsageEvents).set({ status: "succeeded" }).where(eq(aiUsageEvents.id, eventId));
        return NextResponse.json({
          action: input.action,
          text: generatedText,
          notice: "AI-generated suggestion. Review and edit before saving; it is never published automatically.",
        });
      } catch (error) {
        await tx.update(aiUsageEvents).set({ status: "failed" }).where(eq(aiUsageEvents.id, eventId));
        if (error instanceof GeminiProviderError) return providerResponse(error);
        throw error;
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Invalid AI request" }, { status: 400 });
    return toApiErrorResponse(error);
  }
}
