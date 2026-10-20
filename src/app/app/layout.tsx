import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

import { initializeCurrentUserWorkspace } from "@/lib/initialize-user";

export const dynamic = "force-dynamic";

const nav = [["Dashboard", "/app"], ["Content", "/app/content"], ["Calendar", "/app/calendar"], ["Assets", "/app/assets"], ["Settings", "/app/settings"]] as const;

export default async function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { user, workspace } = await initializeCurrentUserWorkspace();
  return <div className="workspace-shell"><aside className="workspace-sidebar"><Link className="brand" href="/app"><span className="brand-mark">C</span><span>CreatorGrid</span></Link><div className="workspace-identity"><span className="workspace-avatar">{workspace.name.slice(0, 1).toUpperCase()}</span><div><strong>{workspace.name}</strong><small>{user.email}</small></div></div><nav className="workspace-nav" aria-label="Workspace navigation">{nav.map(([label, href]) => <Link key={href} href={href}><span aria-hidden="true">{label === "Dashboard" ? "⌂" : label === "Content" ? "▦" : label === "Calendar" ? "◷" : label === "Assets" ? "◇" : "⚙"}</span>{label}</Link>)}</nav><div className="workspace-sidebar-footer"><Link href="/pricing">Upgrade plan</Link><UserButton /></div></aside><main className="workspace-main">{children}</main></div>;
}
