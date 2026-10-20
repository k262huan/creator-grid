"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  ["Dashboard", "/app", "⌂"],
  ["Content", "/app/content", "▦"],
  ["Calendar", "/app/calendar", "◷"],
  ["Assets", "/app/assets", "◇"],
  ["Settings", "/app/settings", "⚙"],
] as const;

export function WorkspaceNav() {
  const pathname = usePathname();

  return (
    <nav className="workspace-nav" aria-label="Workspace navigation">
      {nav.map(([label, href, icon]) => {
        const active = href === "/app" ? pathname === href : pathname.startsWith(href);
        return (
          <Link key={href} href={href} aria-current={active ? "page" : undefined}>
            <span aria-hidden="true">{icon}</span>
            <span className="workspace-nav-label">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
