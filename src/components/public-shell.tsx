import Link from "next/link";
import type { ReactNode } from "react";

export function PublicShell({ children, eyebrow }: { children: ReactNode; eyebrow?: string }) {
  return <div className="site-shell">
    <header className="site-header">
      <Link className="brand" href="/" aria-label="CreatorGrid home"><span className="brand-mark">C</span><span>CreatorGrid</span></Link>
      <nav className="site-nav" aria-label="Main navigation">
        <Link href="/features">Features</Link><Link href="/pricing">Pricing</Link><Link href="/privacy">Privacy</Link>
      </nav>
      <div className="site-actions"><Link className="text-link desktop-only" href="/sign-in">Sign in</Link><Link className="ui-button ui-button-primary" href="/sign-up">Start for free</Link></div>
    </header>
    {eyebrow && <div className="page-eyebrow">{eyebrow}</div>}
    {children}
    <footer className="site-footer"><div><Link className="brand" href="/"><span className="brand-mark">C</span><span>CreatorGrid</span></Link><p>One calm workspace for the content you are building next.</p></div><div className="footer-links"><Link href="/features">Features</Link><Link href="/pricing">Pricing</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/contact">Contact</Link></div><p className="footer-note">© {new Date().getFullYear()} CreatorGrid. Built for thoughtful publishing.</p></footer>
  </div>;
}
