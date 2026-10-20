import { eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";

import { getDb } from "@/db";
import { aiUsageEvents, assets, contentItems, privacyConsents, subscriptions, workspaceMembers, workspaces } from "@/db/schema";
import { toApiErrorResponse } from "@/lib/api-errors";
import { requireApplicationUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await requireApplicationUser();
    const db = getDb();
    const memberships = await db.select({ workspaceId: workspaceMembers.workspaceId, role: workspaceMembers.role })
      .from(workspaceMembers).where(eq(workspaceMembers.userId, user.id));
    const workspaceIds = memberships.map((membership) => membership.workspaceId);

    const [workspaceRows, contentRows, assetRows, consentRows, usageRows, subscriptionRows] = workspaceIds.length === 0
      ? [[], [], [], [], [], []]
      : await Promise.all([
        db.select().from(workspaces).where(inArray(workspaces.id, workspaceIds)),
        db.select().from(contentItems).where(inArray(contentItems.workspaceId, workspaceIds)),
        db.select({ id: assets.id, workspaceId: assets.workspaceId, imagekitFileId: assets.imagekitFileId, fileName: assets.fileName, fileUrl: assets.fileUrl, mimeType: assets.mimeType, fileSizeBytes: assets.fileSizeBytes, createdAt: assets.createdAt }).from(assets).where(inArray(assets.workspaceId, workspaceIds)),
        db.select().from(privacyConsents).where(eq(privacyConsents.userId, user.id)),
        db.select().from(aiUsageEvents).where(inArray(aiUsageEvents.workspaceId, workspaceIds)),
        db.select({ workspaceId: subscriptions.workspaceId, planKey: subscriptions.planKey, status: subscriptions.status, stripeCustomerId: subscriptions.stripeCustomerId, stripeSubscriptionId: subscriptions.stripeSubscriptionId, stripePriceId: subscriptions.stripePriceId, currentPeriodStart: subscriptions.currentPeriodStart, currentPeriodEnd: subscriptions.currentPeriodEnd, cancelAtPeriodEnd: subscriptions.cancelAtPeriodEnd }).from(subscriptions).where(inArray(subscriptions.workspaceId, workspaceIds)),
      ]);

    const payload = {
      exportedAt: new Date().toISOString(),
      profile: {
        id: user.id,
        clerkUserId: user.clerkUserId,
        email: user.email,
        displayName: user.displayName,
        timezone: user.timezone,
        locale: user.locale,
        privacyNoticeVersion: user.privacyNoticeVersion,
        privacyNoticeAcceptedAt: user.privacyNoticeAcceptedAt,
        marketingConsent: user.marketingConsent,
        marketingConsentAt: user.marketingConsentAt,
      },
      memberships,
      workspaces: workspaceRows,
      content: contentRows,
      assetMetadata: assetRows,
      privacyConsents: consentRows,
      aiUsage: usageRows,
      subscriptionReferences: subscriptionRows,
    };

    return new NextResponse(JSON.stringify(payload, null, 2), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="creator-grid-data-${user.id}.json"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return toApiErrorResponse(error);
  }
}
