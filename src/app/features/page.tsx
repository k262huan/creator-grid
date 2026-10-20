import Link from "next/link";

import { PublicShell } from "@/components/public-shell";

const features = [
  ["Content workspace", "Capture ideas, organize production status, assign ownership, and keep every draft close to its context."],
  ["Creative briefs and scripts", "Move from a working title to a useful brief, caption, or script without leaving the content record."],
  ["Publishing calendar", "See scheduled work by month or week, with unscheduled ideas kept visible instead of forgotten."],
  ["Shared asset library", "Upload supported media, keep metadata organized, and associate assets with the content that uses them."],
  ["AI assistance", "Generate ideas, briefs, titles, outlines, and refinements as editable suggestions—not automatic publishing."],
  ["Privacy by default", "Workspace authorization, account export, explicit deletion, and a clear explanation of provider integrations."],
];

export default function FeaturesPage() {
  return <PublicShell eyebrow="Features">
    <main><section className="page-header"><h1>Everything your next piece needs.</h1><p>CreatorGrid is intentionally focused: a practical home for planning and producing content, from the first thought to the final check.</p></section><section className="feature-grid" aria-label="CreatorGrid features">{features.map(([title, description], index) => <article className="feature-card" key={title}><span className="benefit-number">0{index + 1}</span><h2>{title}</h2><p>{description}</p></article>)}</section><section className="section"><div className="workflow-band"><h2>Start small. Build a rhythm.</h2><p>Begin with one workspace and one idea. Add structure only where it helps you keep moving.</p><Link className="ui-button ui-button-secondary" href="/sign-up">Create your free workspace</Link></div></section></main>
  </PublicShell>;
}
