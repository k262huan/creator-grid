import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getDb } from "@/db";
import { subscriptions } from "@/db/schema";
import { toApiErrorResponse } from "@/lib/api-errors";
import { requireApplicationUser } from "@/lib/auth";
import { createWorkspaceAuthorizationStore, requireWorkspaceMember } from "@/lib/authorization";
import { getStripeClient, getStripePriceId, checkoutOrigin, parseBillablePlan } from "@/lib/stripe";

const checkoutSchema = z.object({ workspaceId: z.string().uuid(), planKey: z.string().trim() });

export async function POST(request: Request) {
  try {
    const user = await requireApplicationUser();
    const input = checkoutSchema.parse(await request.json());
    const planKey = parseBillablePlan(input.planKey);
    await requireWorkspaceMember(createWorkspaceAuthorizationStore(getDb()), user.id, input.workspaceId, "owner");
    const [existing] = await getDb().select({ stripeCustomerId: subscriptions.stripeCustomerId }).from(subscriptions).where(and(eq(subscriptions.workspaceId, input.workspaceId), eq(subscriptions.planKey, planKey))).orderBy(subscriptions.updatedAt).limit(1);
    const stripe = getStripeClient();
    const customerId = existing?.stripeCustomerId ?? (await stripe.customers.create({ email: user.email, metadata: { workspaceId: input.workspaceId, userId: user.id } })).id;
    const idempotencyKey = request.headers.get("Idempotency-Key") ?? `checkout:${input.workspaceId}:${planKey}:${new Date().toISOString().slice(0, 16)}`;
    const session = await stripe.checkout.sessions.create({ mode: "subscription", customer: customerId, line_items: [{ price: getStripePriceId(planKey), quantity: 1 }], success_url: `${checkoutOrigin()}/app/settings?checkout=success`, cancel_url: `${checkoutOrigin()}/app/settings?checkout=cancelled`, client_reference_id: input.workspaceId, metadata: { workspaceId: input.workspaceId, userId: user.id, planKey }, subscription_data: { metadata: { workspaceId: input.workspaceId, userId: user.id, planKey } }, }, { idempotencyKey });
    if (!session.url) return NextResponse.json({ error: "Checkout session did not return a URL" }, { status: 502 });
    return NextResponse.json({ url: session.url });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Invalid checkout request" }, { status: 400 });
    if (error instanceof Error && error.message === "Plan is not purchasable") return NextResponse.json({ error: "This plan cannot be purchased" }, { status: 400 });
    return toApiErrorResponse(error);
  }
}
