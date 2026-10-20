import type { ButtonHTMLAttributes, InputHTMLAttributes, LabelHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";

export function Button({ variant = "primary", className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" }) {
  return <button className={`ui-button ui-button-${variant} ${className}`} {...props} />;
}

export function Field({ label, error, hint, children, className = "" }: { label: string; error?: string; hint?: string; children: ReactNode; className?: string }) {
  return <div className={`ui-field ${className}`}>
    <label className="ui-label">{label}{children}</label>
    {hint && !error && <span className="ui-hint">{hint}</span>}
    {error && <p className="ui-error" role="alert">{error}</p>}
  </div>;
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className="ui-input" {...props} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className="ui-input" {...props} />;
}

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "success" | "accent" }) {
  return <span className={`ui-badge ui-badge-${tone}`}>{children}</span>;
}

export function Alert({ children, tone = "info" }: { children: ReactNode; tone?: "info" | "error" | "success" }) {
  return <div className={`ui-alert ui-alert-${tone}`} role={tone === "error" ? "alert" : "status"}>{children}</div>;
}

export function LoadingState({ label = "Loading" }: { label?: string }) {
  return <div className="ui-state" role="status" aria-live="polite"><span className="ui-spinner" aria-hidden="true" />{label}…</div>;
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <div className="ui-empty"><div className="ui-empty-mark" aria-hidden="true">✦</div><h3>{title}</h3><p>{description}</p>{action}</div>;
}

export function Dialog({ title, children }: { title: string; children: ReactNode }) {
  return <dialog className="ui-dialog" aria-labelledby="dialog-title"><h2 id="dialog-title">{title}</h2>{children}</dialog>;
}

export type LabelProps = LabelHTMLAttributes<HTMLLabelElement>;
