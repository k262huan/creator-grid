import { initializeCurrentUserWorkspace } from "@/lib/initialize-user";

import { AssetUploadControl } from "./AssetUploadControl";

export const dynamic = "force-dynamic";

export default async function AssetsPage() {
  const { workspace } = await initializeCurrentUserWorkspace();
  return (
    <main>
      <p><a href="/app">← Back to workspace</a></p>
      <h1>Assets</h1>
      <p>Files are uploaded directly to ImageKit after server authorization, then recorded in the current workspace.</p>
      <AssetUploadControl workspaceId={workspace.id} />
    </main>
  );
}
