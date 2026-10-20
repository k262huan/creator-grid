import { PublicShell } from "@/components/public-shell";

export const metadata = { title: "Contact | CreatorGrid" };

export default function ContactPage() {
  return <PublicShell eyebrow="Contact"><main><article className="prose"><h1>Let’s talk.</h1><p>Have a question about CreatorGrid, a privacy request, or a workspace issue? Send us a note and include the account email associated with your request.</p><p><a className="ui-button ui-button-primary" href="mailto:hello@creatorgrid.example">Email hello@creatorgrid.example</a></p><h2>Privacy requests</h2><p>For access, correction, export, or deletion requests, contact <a href="mailto:privacy@creatorgrid.example">privacy@creatorgrid.example</a>. We verify account authority before making changes or disclosing data.</p></article></main></PublicShell>;
}
