"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { withAuthorizedTransaction } from "@/db/authorized";
import { privacyConsents, users } from "@/db/schema";

const settingsSchema = z.object({
  displayName: z.string().trim().max(120).nullable(),
  timezone: z.string().trim().min(1).max(64),
  locale: z.string().trim().min(2).max(16),
  privacyNoticeAccepted: z.boolean(),
  marketingConsent: z.boolean(),
});

export async function updateAccountSettings(formData: FormData) {
  const input = settingsSchema.parse({
    displayName: String(formData.get("displayName") ?? "").trim() || null,
    timezone: String(formData.get("timezone") ?? "UTC"),
    locale: String(formData.get("locale") ?? "en"),
    privacyNoticeAccepted: formData.get("privacyNoticeAccepted") === "on",
    marketingConsent: formData.get("marketingConsent") === "on",
  });

  await withAuthorizedTransaction(async (tx, user) => {
    const now = new Date();
    await tx.update(users).set({
      displayName: input.displayName,
      timezone: input.timezone,
      locale: input.locale,
      privacyNoticeVersion: input.privacyNoticeAccepted ? "v1" : null,
      privacyNoticeAcceptedAt: input.privacyNoticeAccepted ? (user.privacyNoticeAcceptedAt ?? now) : null,
      marketingConsent: input.marketingConsent,
      marketingConsentAt: input.marketingConsent ? (user.marketingConsentAt ?? now) : null,
      updatedAt: now,
    }).where(eq(users.id, user.id));

    await tx.insert(privacyConsents).values({
      userId: user.id,
      consentType: "privacy_notice",
      noticeVersion: "v1",
      consented: input.privacyNoticeAccepted,
      consentedAt: now,
      withdrawnAt: input.privacyNoticeAccepted ? null : now,
    });
  });

  revalidatePath("/app");
  revalidatePath("/app/settings");
}
