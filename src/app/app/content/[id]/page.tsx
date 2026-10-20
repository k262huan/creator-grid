import Link from "next/link";
import { and, eq } from "drizzle-orm";

import { getDb } from "@/db";
import { assets, contentAssets } from "@/db/schema";
import { Badge, Button, Field, TextInput } from "@/components/ui";
import { requireApplicationUser } from "@/lib/auth";
import { getContent } from "@/lib/content";
import { initializeCurrentUserWorkspace } from "@/lib/initialize-user";
import { addMetricAction, deleteContentAction, updateContentAction } from "@/app/app/content/actions";
import { ContentForm } from "@/app/app/content/ContentForm";
import { DeleteContentButton } from "@/app/app/content/DeleteContentButton";
import { AiAssistPanel } from "@/app/app/content/AiAssistPanel";

export const dynamic = "force-dynamic";

export default async function ContentEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; await initializeCurrentUserWorkspace(); const user = await requireApplicationUser(); const item = await getContent(user.id, id);
  const linkedAssets = await getDb().select({ asset: assets }).from(contentAssets).innerJoin(assets, and(eq(assets.id, contentAssets.assetId), eq(assets.workspaceId, item.workspaceId))).where(and(eq(contentAssets.contentItemId, id), eq(contentAssets.workspaceId, item.workspaceId)));
  const initial = { title: item.content.title, description: item.content.description, contentType: item.content.contentType, platform: item.content.platform, status: item.content.status, scheduledAt: item.content.scheduledAt ? new Date(item.content.scheduledAt).toISOString().slice(0, 16) : null, brief: item.content.brief, script: item.content.script };
  return <div className="workspace-container"><p><Link href="/app/content">← Back to content</Link></p><header className="workspace-topbar"><div><p className="workspace-kicker">Editor · {item.content.contentType.replaceAll("_", " ")}</p><h1>{item.content.title}</h1><p>Updated {item.content.updatedAt.toLocaleString()} · <Badge>{item.content.status.replaceAll("_", " ")}</Badge></p></div><DeleteContentButton id={id} action={deleteContentAction} /></header><div className="editor-grid"><section className="editor-main"><div className="editor-card"><ContentForm action={updateContentAction} id={id} initial={initial} submitLabel="Save changes" /></div><AiAssistPanel workspaceId={item.workspaceId} title={item.content.title} existingText={item.content.script ?? item.content.brief ?? ""} /></section><aside className="editor-side"><section className="editor-card"><h2>Assets</h2>{linkedAssets.length === 0 ? <p>No assets associated yet.</p> : <ul className="data-list">{linkedAssets.map(({ asset }) => <li key={asset.id}><span>{asset.fileName}</span><small>{asset.mimeType}</small></li>)}</ul>}<Link className="ui-button ui-button-secondary" href={`/app/assets?contentItemId=${id}`}>Open asset library</Link></section><section className="editor-card"><h2>Performance</h2>{item.content.status !== "published" ? <p>Metrics become available after publishing.</p> : <><ul className="data-list">{item.metrics.map((metric) => <li key={metric.id}><span>{metric.metricName}</span><strong>{metric.metricValue}</strong></li>)}</ul><form className="editor-form" action={addMetricAction}><input type="hidden" name="contentItemId" value={id} /><Field label="Metric name"><TextInput name="metricName" required placeholder="Views" /></Field><Field label="Value"><TextInput name="metricValue" type="number" min="0" step="any" required /></Field><Button type="submit" variant="secondary">Add metric</Button></form></>}</section></aside></div></div>;
}
