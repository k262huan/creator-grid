import Link from "next/link";

import { PublicShell } from "@/components/public-shell";

export default function HomePage() {
  return <PublicShell>
    <main>
      <section className="hero" aria-labelledby="hero-title">
        <div>
          <p className="page-eyebrow" style={{ padding: 0, margin: 0 }}>The calm content workspace</p>
          <h1 id="hero-title">Make space for your <em>best work.</em></h1>
          <p className="hero-copy">CreatorGrid brings ideas, briefs, scripts, assets, and publishing plans into one clear workspace—so your creative process can move forward.</p>
          <div className="hero-actions"><Link className="ui-button ui-button-primary" href="/sign-up">Start for free <span aria-hidden="true">→</span></Link><Link className="ui-button ui-button-secondary" href="/features">Explore features</Link></div>
          <p className="hero-note">No card required · Built for solo creators and small teams</p>
        </div>
        <div className="preview-card" aria-label="Illustration of a CreatorGrid content workspace">
          <div className="preview-top"><strong>CreatorGrid</strong><div className="preview-dots" aria-hidden="true"><span /><span /><span /></div></div>
          <div className="preview-content"><small>THIS WEEK · CONTENT PLAN</small><h2>Build a rhythm that lasts.</h2><div className="preview-row"><div><strong>Podcast: The creative reset</strong><small>Brief · Tuesday</small></div><span className="preview-pill">In review</span></div><div className="preview-row"><div><strong>Studio tour short</strong><small>Script · Thursday</small></div><span className="preview-pill">Planned</span></div><div className="preview-row"><div><strong>Newsletter: Field notes</strong><small>Publish · Friday</small></div><span className="preview-pill">Idea</span></div></div>
        </div>
      </section>
      <section className="section" aria-labelledby="benefits-title"><div className="section-heading"><h2 id="benefits-title">From scattered thoughts to finished work.</h2><p>A simple system for the parts of publishing that deserve more than another open tab.</p></div><div className="benefit-grid"><article className="benefit-card"><span className="benefit-number">01 / CAPTURE</span><h3>Keep the spark</h3><p>Turn quick ideas into structured content items before they disappear.</p></article><article className="benefit-card"><span className="benefit-number">02 / DEVELOP</span><h3>Give it shape</h3><p>Write briefs, scripts, captions, and notes alongside the work they belong to.</p></article><article className="benefit-card"><span className="benefit-number">03 / SHIP</span><h3>Publish with intent</h3><p>See what is next, what needs attention, and what is ready to go.</p></article></div></section>
      <section className="section"><div className="workflow-band"><div className="section-heading"><h2>One clear view of the work.</h2><p>CreatorGrid stays focused on the workflow—not vanity metrics or noisy feeds.</p></div><div className="workflow-steps"><div className="workflow-step"><strong>Plan</strong><span>Ideas and publishing dates</span></div><div className="workflow-step"><strong>Produce</strong><span>Briefs, scripts, and assets</span></div><div className="workflow-step"><strong>Review</strong><span>Statuses and shared context</span></div><div className="workflow-step"><strong>Publish</strong><span>A confident final check</span></div></div></div></section>
    </main>
  </PublicShell>;
}
