import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

import { initializeCurrentUserWorkspace } from "@/lib/initialize-user";
import { WorkspaceNav } from "./WorkspaceNav";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { user, workspace } = await initializeCurrentUserWorkspace();
  return <div className="workspace-shell"><aside className="workspace-sidebar"><Link className="brand" href="/app"><span className="brand-mark">C</span><span>CreatorGrid</span></Link><div className="workspace-identity"><span className="workspace-avatar">{workspace.name.slice(0, 1).toUpperCase()}</span><div><strong>{workspace.name}</strong><small>{user.email}</small></div></div><WorkspaceNav /><div className="workspace-sidebar-footer"><Link className="workspace-upgrade" href="/pricing"><span><small>Workspace plan</small><strong>Explore upgrades</strong></span><span aria-hidden="true">↗</span></Link><div className="workspace-account"><span>Account</span><UserButton /></div></div></aside><main className="workspace-main">{children}</main></div>;
}
