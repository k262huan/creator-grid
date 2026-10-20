import Link from "next/link";

import { ContentForm } from "@/app/app/content/ContentForm";
import { createContentAction } from "@/app/app/content/actions";
import { initializeCurrentUserWorkspace } from "@/lib/initialize-user";

export const dynamic = "force-dynamic";

export default async function NewContentPage() {
  const { workspace } = await initializeCurrentUserWorkspace();
  return <div className="workspace-container"><p className="workspace-backlink"><Link href="/app/content">← Back to content</Link></p><header className="workspace-topbar"><div><p className="workspace-kicker">Create</p><h1>New content</h1><p>Start with enough structure to make the next step obvious.</p></div></header><section className="editor-card"><ContentForm action={createContentAction} workspaceId={workspace.id} submitLabel="Create content" /></section></div>;
}
