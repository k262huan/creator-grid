export const metadata = { title: "Privacy notice | CreatorGrid" };

export default function PrivacyPage() {
  return (
    <main>
      <h1>Privacy notice</h1>
      <p>Last updated: October 20, 2026</p>
      <h2>What we collect</h2>
      <p>CreatorGrid collects account identity data from Clerk, profile and consent settings, workspace and content records, uploaded asset metadata, subscription references, and minimal AI usage metadata. We do not store payment-card data or raw AI prompts by default.</p>
      <h2>How providers are used</h2>
      <p>Clerk provides authentication. Neon/PostgreSQL stores application data. ImageKit stores uploaded files. Gemini processes the minimum text needed for an AI suggestion. Stripe processes test-mode billing events and subscription references; CreatorGrid does not receive card numbers.</p>
      <h2>Retention and sharing</h2>
      <p>Data is retained while the account or workspace is active, subject to backup, security, billing, and legal retention requirements. We do not sell personal information. Providers process data only to operate the requested services.</p>
      <h2>Your choices</h2>
      <p>Authenticated users can update profile, timezone, locale, privacy notice, and marketing preferences in account settings. Use the account export action to download application-owned data. Account deletion requires explicit confirmation and cannot silently transfer workspace ownership.</p>
      <h2>Questions and requests</h2>
      <p>For privacy questions, corrections, exports, or deletion requests, contact <a href="mailto:privacy@creatorgrid.example">privacy@creatorgrid.example</a>. We will verify account authority before disclosing or changing data.</p>
    </main>
  );
}
