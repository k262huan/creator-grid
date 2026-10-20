/* eslint-disable @next/next/no-img-element -- ImageKit URLs are provider-configured at runtime. */
import { and, desc, eq } from "drizzle-orm";
import Link from "next/link";

import { getDb } from "@/db";
import { assets, contentAssets, workspaceMembers } from "@/db/schema";
import { Badge, EmptyState } from "@/components/ui";
import { createWorkspaceAuthorizationStore, requireWorkspaceMember } from "@/lib/authorization";
import { requireApplicationUser } from "@/lib/auth";
import { initializeCurrentUserWorkspace } from "@/lib/initialize-user";
import { AssetActions } from "./AssetActions";
import { AssetUploadControl } from "./AssetUploadControl";

export const dynamic = "force-dynamic";

function sizeLabel(bytes: number) { if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`; return `${(bytes / (1024 * 1024)).toFixed(1)} MB`; }

export default async function AssetsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { workspace } = await initializeCurrentUserWorkspace(); const user = await requireApplicationUser(); await requireWorkspaceMember(createWorkspaceAuthorizationStore(getDb()), user.id, workspace.id); const params = await searchParams; const contentItemId = typeof params.contentItemId === "string" ? params.contentItemId : undefined;
  const rows = await getDb().select({ asset: assets, link: contentAssets.id }).from(assets).leftJoin(contentAssets, and(eq(contentAssets.assetId, assets.id), contentItemId ? eq(contentAssets.contentItemId, contentItemId) : undefined)).innerJoin(workspaceMembers, eq(workspaceMembers.workspaceId, assets.workspaceId)).where(and(eq(assets.workspaceId, workspace.id), eq(workspaceMembers.userId, user.id))).orderBy(desc(assets.createdAt));
  return <div className="workspace-container"><p><Link href={contentItemId ? `/app/content/${contentItemId}` : "/app"}>← Back to {contentItemId ? "editor" : "workspace"}</Link></p><header className="workspace-topbar"><div><p className="workspace-kicker">Library · {workspace.name}</p><h1>Assets</h1><p>Files are authorized on the server, delivered by ImageKit, and recorded in this workspace.</p></div></header><section className="panel"><AssetUploadControl workspaceId={workspace.id} /></section><section className="section" style={{ paddingTop: "1.5rem" }}>{rows.length === 0 ? <EmptyState title="No assets yet" description="Upload an image, video, or audio file to build your shared library." /> : <div className="feature-grid">{rows.map(({ asset, link }) => <article className="feature-card" key={asset.id}>{asset.mimeType.startsWith("image/") && <img src={asset.fileUrl} alt={asset.fileName} style={{ borderRadius: 10, display: "block", height: 140, objectFit: "cover", width: "100%" }} />}<h2>{asset.fileName}</h2><p>{asset.mimeType} · {sizeLabel(asset.fileSizeBytes)}</p><Badge tone={link ? "success" : "neutral"}>{link ? "Associated" : "Available"}</Badge><AssetActions assetId={asset.id} contentItemId={contentItemId} canDelete={user.id === workspace.ownerUserId} isAssociated={Boolean(link)} /></article>)}</div>}</section></div>;
}
