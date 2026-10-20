import { PublicShell } from "@/components/public-shell";

export const metadata = { title: "Terms | CreatorGrid" };

export default function TermsPage() {
  return <PublicShell eyebrow="Terms"><main><article className="prose"><h1>Terms of use</h1><p>Last updated: October 20, 2026</p><h2>Use of the service</h2><p>CreatorGrid provides tools for organizing and drafting creator content. You are responsible for the content you create, review, upload, and publish.</p><h2>Third-party services</h2><p>The service relies on Clerk, Neon, ImageKit, Gemini, and Stripe test-mode integrations where configured. Provider availability may affect features, and AI output requires your review.</p><h2>Acceptable use</h2><p>Do not use CreatorGrid to violate law, infringe rights, upload malicious material, or attempt to access another workspace.</p><h2>Questions</h2><p>Contact <a href="mailto:hello@creatorgrid.example">hello@creatorgrid.example</a> with questions about these terms.</p></article></main></PublicShell>;
}
