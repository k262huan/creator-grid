import { requireApplicationUser } from "@/lib/auth";

import { updateAccountSettings } from "./actions";

export const dynamic = "force-dynamic";

export default async function AccountSettingsPage() {
  const user = await requireApplicationUser();

  return (
    <main>
      <p><a href="/app">← Back to workspace</a></p>
      <h1>Account settings</h1>
      <form action={updateAccountSettings}>
        <label>
          Display name
          <input name="displayName" defaultValue={user.displayName ?? ""} maxLength={120} />
        </label>
        <label>
          Timezone
          <input name="timezone" defaultValue={user.timezone} maxLength={64} required />
        </label>
        <label>
          Locale
          <input name="locale" defaultValue={user.locale} maxLength={16} required />
        </label>
        <label>
          <input name="privacyNoticeAccepted" type="checkbox" defaultChecked={Boolean(user.privacyNoticeAcceptedAt)} />
          I accept the current privacy notice.
        </label>
        <label>
          <input name="marketingConsent" type="checkbox" defaultChecked={user.marketingConsent} />
          I would like to receive product updates.
        </label>
        <button type="submit">Save settings</button>
      </form>
    </main>
  );
}
