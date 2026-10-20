import { eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { z } from "zod";

import { getDb } from "@/db";
import { stripeWebhookEvents, subscriptions } from "@/db/schema";
import { getServerEnv } from "@/lib/env";
import { getStripeClient, normalizeStripeSubscription, type SubscriptionSnapshot } from "@/lib/stripe";

const supportedEvents = new Set([
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "invoice.paid",
  "invoice.payment_failed",
]);

function eventSignature(request: Request): string {
  const value = request.headers.get("stripe-signature");
  if (!value) throw new Error("Missing Stripe signature");
  return value;
}

async function subscriptionFromId(id: string): Promise<Stripe.Subscription> {
  return getStripeClient().subscriptions.retrieve(id);
}

async function snapshotForEvent(event: Stripe.Event): Promise<{ snapshot: SubscriptionSnapshot; workspaceId?: string }> {
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (!session.subscription || typeof session.subscription !== "string") throw new Error("Checkout session has no subscription");
    const subscription = await subscriptionFromId(session.subscription);
    const snapshot = normalizeStripeSubscription(subscription);
    return { snapshot: { ...snapshot, userId: snapshot.userId ?? session.metadata?.userId, workspaceId: snapshot.workspaceId ?? session.metadata?.workspaceId }, workspaceId: session.metadata?.workspaceId ?? snapshot.workspaceId };
  }

  const object = event.data.object as Stripe.Subscription | Stripe.Invoice;
  const invoice = object as Stripe.Invoice;
  const subscriptionReference = invoice.parent?.type === "subscription_details" ? invoice.parent.subscription_details?.subscription : undefined;
  const subscriptionId = event.type.startsWith("customer.subscription.") ? (object as Stripe.Subscription).id : typeof subscriptionReference === "string" ? subscriptionReference : subscriptionReference?.id;
  if (!subscriptionId) throw new Error("Stripe event has no subscription reference");
  const subscription = event.type === "customer.subscription.deleted" ? object as Stripe.Subscription : await subscriptionFromId(subscriptionId);
  const snapshot = normalizeStripeSubscription(subscription);
  return { snapshot, workspaceId: snapshot.workspaceId };
}

async function applySnapshot(event: Stripe.Event, snapshot: SubscriptionSnapshot, workspaceId: string): Promise<"processed" | "duplicate"> {
  z.string().uuid().parse(workspaceId);
  if (!snapshot.userId) throw new Error("Stripe subscription is missing trusted user metadata");
  z.string().uuid().parse(snapshot.userId);
  const db = getDb();
  return db.transaction(async (tx) => {
    await tx.execute(sql`select set_config('app.user_id', ${snapshot.userId}::text, true)`);
    const [claimed] = await tx.insert(stripeWebhookEvents).values({ stripeEventId: event.id, eventType: event.type, processingStatus: "processing" }).onConflictDoNothing({ target: stripeWebhookEvents.stripeEventId }).returning({ id: stripeWebhookEvents.id });
    if (!claimed) return "duplicate";
    await tx.insert(subscriptions).values({
      workspaceId,
      planKey: snapshot.planKey,
      stripeCustomerId: snapshot.stripeCustomerId,
      stripeSubscriptionId: snapshot.stripeSubscriptionId,
      stripePriceId: snapshot.priceId,
      status: snapshot.status,
      currentPeriodStart: snapshot.currentPeriodStart,
      currentPeriodEnd: snapshot.currentPeriodEnd,
      cancelAtPeriodEnd: snapshot.cancelAtPeriodEnd,
      updatedAt: new Date(),
    }).onConflictDoUpdate({ target: subscriptions.stripeSubscriptionId, set: {
      workspaceId,
      planKey: snapshot.planKey,
      stripeCustomerId: snapshot.stripeCustomerId,
      stripePriceId: snapshot.priceId,
      status: snapshot.status,
      currentPeriodStart: snapshot.currentPeriodStart,
      currentPeriodEnd: snapshot.currentPeriodEnd,
      cancelAtPeriodEnd: snapshot.cancelAtPeriodEnd,
      updatedAt: new Date(),
    } });
    await tx.update(stripeWebhookEvents).set({ processingStatus: "processed", processedAt: new Date() }).where(eq(stripeWebhookEvents.id, claimed.id));
    return "processed";
  });
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  let event: Stripe.Event;
  try {
    event = getStripeClient().webhooks.constructEvent(rawBody, eventSignature(request), getServerEnv().STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: "Invalid Stripe signature" }, { status: 400 });
  }
  if (!supportedEvents.has(event.type)) return NextResponse.json({ error: "Unsupported Stripe event" }, { status: 400 });

  try {
    const { snapshot, workspaceId } = await snapshotForEvent(event);
    if (!workspaceId) throw new Error("Stripe event is missing trusted workspace metadata");
    const result = await applySnapshot(event, snapshot, workspaceId);
    return NextResponse.json({ received: true, duplicate: result === "duplicate" });
  } catch (error) {
    console.error("Stripe webhook processing failed", error instanceof Error ? error.name : "unknown");
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
