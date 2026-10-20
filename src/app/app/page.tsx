import Link from "next/link";
import { eq } from "drizzle-orm";

import { getDb } from "@/db";
import { subscriptions } from "@/db/schema";
import { Badge, EmptyState } from "@/components/ui";
import { dashboardData } from "@/lib/content";
import { initializeCurrentUserWorkspace } from "@/lib/initialize-user";
import { resolveEntitlements } from "@/lib/plans";

export const dynamic = "force-dynamic";

const statuses = [["idea", "Ideas"], ["planned", "Planned"], ["in_production", "In production"], ["in_review", "In review"]] as const;

export default async function AppPage() {
  const { user, workspace } = await initializeCurrentUserWorkspace();
  const data = await dashboardData(user.id, workspace.id);
  const [subscription] = await getDb().select({ planKey: subscriptions.planKey, status: subscriptions.status, currentPeriodEnd: subscriptions.currentPeriodEnd, cancelAtPeriodEnd: subscriptions.cancelAtPeriodEnd }).from(subscriptions).where(eq(subscriptions.workspaceId, workspace.id)).orderBy(subscriptions.updatedAt).limit(1);
  const plan = resolveEntitlements(subscription);
  const counts = new Map(data.statusCounts.map((item) => [item.status, Number(item.count)]));
  const hasContent = data.recent.length > 0;
  return <div className="workspace-container"><header className="workspace-topbar"><div><p className="workspace-kicker">Dashboard · {workspace.name}</p><h1>Good to see you, {user.displayName?.split(" ")[0] ?? "creator"}.</h1><p>Here’s what is moving through your workspace.</p></div><div className="workspace-actions"><Link className="ui-button ui-button-secondary" href="/app/calendar">Open calendar</Link><Link className="ui-button ui-button-primary" href="/app/content/new">New content <span aria-hidden="true">+</span></Link></div></header>{!hasContent ? <EmptyState title="Your workspace is ready." description="Start with one idea and give it a title, a status, and a next step." action={<Link className="ui-button ui-button-primary" href="/app/content/new">Create your first idea</Link>} /> : <><section className="stat-grid" aria-label="Content status counts">{statuses.map(([status, label]) => <article className="stat-card" key={status}><span>{label}</span><strong>{counts.get(status) ?? 0}</strong></article>)}</section><div className="dashboard-grid"><section className="panel"><div className="panel-header"><h2>Coming up</h2><Link href="/app/calendar">View calendar</Link></div>{data.upcoming.length === 0 ? <p>No scheduled content yet.</p> : <ul className="data-list">{data.upcoming.map((item) => <li key={item.id}><div><Link href={`/app/content/${item.id}`}><strong>{item.title}</strong></Link><small>{item.scheduledAt?.toLocaleString() ?? "No date"}</small></div><Badge>{item.status.replaceAll("_", " ")}</Badge></li>)}</ul>}</section><section className="panel"><div className="panel-header"><h2>Recently updated</h2><Link href="/app/content">All content</Link></div><ul className="data-list">{data.recent.map((item) => <li key={item.id}><div><Link href={`/app/content/${item.id}`}><strong>{item.title}</strong></Link><small>Updated {item.updatedAt.toLocaleDateString()}</small></div><Badge tone={item.status === "published" ? "success" : "neutral"}>{item.status.replaceAll("_", " ")}</Badge></li>)}</ul></section></div></>}<section className="panel" style={{ marginTop: "1rem" }}><div className="panel-header"><h2>{plan.displayName} plan</h2><Link href="/pricing">Compare plans</Link></div><p>{plan.contentLimit === null ? "Unlimited active content" : `${plan.contentLimit} active content items`} · {plan.aiDailyLimit} AI assists per day · {plan.capabilities.collaboration ? "Collaboration enabled" : "Personal workspace"}</p></section></div>;
}
