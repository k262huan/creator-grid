import Link from "next/link";

import { PublicShell } from "@/components/public-shell";
import { getPublicPlanConfig, PLAN_KEYS } from "@/lib/plans";

function formatLimit(limit: number | null, suffix: string) { return limit === null ? "Unlimited" : `${limit.toLocaleString()} ${suffix}`; }

export default function PricingPage() {
  const plans = getPublicPlanConfig();
  return <PublicShell eyebrow="Pricing"><main><section className="page-header"><h1>Choose your pace.</h1><p>Start with the essentials, then add room for more content, more AI assistance, or a more collaborative workflow.</p></section><section className="pricing-grid" aria-label="Pricing plans">{PLAN_KEYS.map((key) => { const plan = plans[key]; const featured = key === "creator_pro"; return <article className={`pricing-card ${featured ? "featured" : ""}`} key={key}>{featured && <span className="ui-badge ui-badge-accent">Most popular</span>}<h2>{plan.displayName}</h2><p>{key === "free" ? "A focused home for getting started." : key === "creator_pro" ? "More capacity for a consistent practice." : "Shared clarity for a growing team."}</p><div className="price">{plan.monthlyPrice === "0" ? "Free" : `$${plan.monthlyPrice}`}<small>{plan.monthlyPrice === "0" ? " forever" : " / month"}</small></div><ul><li>{formatLimit(plan.contentLimit, "active content items")}</li><li>{plan.aiDailyLimit} AI assists per day</li><li>{plan.capabilities.collaboration ? "Team collaboration" : "Personal workspace"}</li><li>{plan.capabilities.clientReview ? "Client review access" : "Core planning tools"}</li><li>{plan.capabilities.advancedAnalytics ? "Advanced analytics" : "Planning essentials"}</li></ul><Link className={`ui-button ${featured ? "ui-button-primary" : "ui-button-secondary"}`} href="/sign-up">{key === "free" ? "Start for free" : `Choose ${plan.displayName}`}</Link></article>; })}</section><p className="hero-note" style={{ marginTop: "1.5rem" }}>Free does not require payment details. Prices and limits shown here come from the same plan configuration used by the server.</p></main></PublicShell>;
}
