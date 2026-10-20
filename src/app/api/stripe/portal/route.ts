import { and, eq, isNotNull } from "drizzle-orm";
import { NextResponse } from "next/server";

import { getDb } from "@/db";
import { subscriptions } from "@/db/schema";
import { toApiErrorResponse } from "@/lib/api-errors";
import { requireApplicationUser } from "@/lib/auth";
import { createWorkspaceAuthorizationStore, requireWorkspaceMember } from "@/lib/authorization";
import { checkoutOrigin, getStripeClient } from "@/lib/stripe";

export async function POST(request: Request) {
  try {
    const user = await requireApplicationUser(); const input = await request.json() as { workspaceId?: unknown }; const workspaceId = typeof input.workspaceId === "string" ? input.workspaceId : "";
    await requireWorkspaceMember(createWorkspaceAuthorizationStore(getDb()), user.id, workspaceId, "owner");
    const [subscription] = await getDb().select({ customerId: subscriptions.stripeCustomerId }).from(subscriptions).where(and(eq(subscriptions.workspaceId, workspaceId), isNotNull(subscriptions.stripeCustomerId))).orderBy(subscriptions.updatedAt).limit(1);
    if (!subscription?.customerId) return NextResponse.json({ error: "No confirmed Stripe subscription is available" }, { status: 409 });
    const session = await getStripeClient().billingPortal.sessions.create({ customer: subscription.customerId, return_url: `${checkoutOrigin()}/app/settings` });
    return NextResponse.json({ url: session.url });
  } catch (error) { return toApiErrorResponse(error); }
}
