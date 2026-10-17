import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { withAuthorizedTransaction } from "@/db/authorized";
import { privacyConsents, users } from "@/db/schema";
import { toApiErrorResponse } from "@/lib/api-errors";

const settingsSchema = z.object({
  displayName: z.string().trim().max(120).nullable(),
  timezone: z.string().trim().min(1).max(64),
  locale: z.string().trim().min(2).max(16),
  privacyNoticeAccepted: z.boolean(),
  marketingConsent: z.boolean(),
});

const privacyNoticeVersion = "v1";

export async function GET() {
  try {
    return await withAuthorizedTransaction(async (_tx, user) =>
      NextResponse.json({
        displayName: user.displayName,
        timezone: user.timezone,
        locale: user.locale,
        privacyNoticeVersion: user.privacyNoticeVersion,
        privacyNoticeAcceptedAt: user.privacyNoticeAcceptedAt,
        marketingConsent: user.marketingConsent,
        marketingConsentAt: user.marketingConsentAt,
      }),
    );
  } catch (error) {
    return toApiErrorResponse(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const input = settingsSchema.parse(await request.json());

    return await withAuthorizedTransaction(async (tx, user) => {
      const now = new Date();
      const privacyNoticeAcceptedAt = input.privacyNoticeAccepted ? (user.privacyNoticeAcceptedAt ?? now) : null;
      const marketingConsentAt = input.marketingConsent ? (user.marketingConsentAt ?? now) : null;

      const [updatedUser] = await tx
        .update(users)
        .set({
          displayName: input.displayName,
          timezone: input.timezone,
          locale: input.locale,
          privacyNoticeVersion: input.privacyNoticeAccepted ? privacyNoticeVersion : null,
          privacyNoticeAcceptedAt,
          marketingConsent: input.marketingConsent,
          marketingConsentAt,
          updatedAt: now,
        })
        .where(eq(users.id, user.id))
        .returning();

      if (!updatedUser) {
        return NextResponse.json({ error: "Account not found" }, { status: 404 });
      }

      await tx.insert(privacyConsents).values({
        userId: user.id,
        consentType: "privacy_notice",
        noticeVersion: privacyNoticeVersion,
        consented: input.privacyNoticeAccepted,
        consentedAt: input.privacyNoticeAccepted ? now : (user.privacyNoticeAcceptedAt ?? now),
        withdrawnAt: input.privacyNoticeAccepted ? null : now,
      });

      return NextResponse.json({
        displayName: updatedUser.displayName,
        timezone: updatedUser.timezone,
        locale: updatedUser.locale,
        privacyNoticeAcceptedAt: updatedUser.privacyNoticeAcceptedAt,
        marketingConsent: updatedUser.marketingConsent,
        marketingConsentAt: updatedUser.marketingConsentAt,
      });
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid account settings", fields: error.flatten().fieldErrors }, { status: 400 });
    }
    return toApiErrorResponse(error);
  }
}
