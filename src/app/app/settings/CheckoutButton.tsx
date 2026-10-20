"use client";

import { useState } from "react";

export function CheckoutButton({ workspaceId, planKey, label }: { workspaceId: string; planKey: "creator_pro" | "team"; label: string }) {
  const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  async function start() { setBusy(true); setError(""); try { const response = await fetch("/api/stripe/checkout", { method: "POST", headers: { "Content-Type": "application/json", "Idempotency-Key": `ui-${workspaceId}-${planKey}-${Date.now()}` }, body: JSON.stringify({ workspaceId, planKey }) }); const data = await response.json(); if (!response.ok || !data.url) throw new Error(data.error ?? "Checkout is unavailable"); window.location.assign(data.url); } catch (reason) { setError(reason instanceof Error ? reason.message : "Checkout is unavailable"); setBusy(false); } }
  return <div><button className="ui-button ui-button-primary" type="button" onClick={() => void start()} disabled={busy}>{busy ? "Opening checkout…" : label}</button>{error && <p className="ui-error" role="alert">{error}</p>}</div>;
}
