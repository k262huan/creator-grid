"use client";

import { useState } from "react";

export function ManageSubscriptionButton({ workspaceId }: { workspaceId: string }) {
  const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  async function openPortal() { setBusy(true); setError(""); try { const response = await fetch("/api/stripe/portal", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ workspaceId }) }); const data = await response.json(); if (!response.ok) throw new Error(data.error ?? "Subscription management is unavailable"); window.location.assign(data.url); } catch (reason) { setError(reason instanceof Error ? reason.message : "Subscription management is unavailable"); setBusy(false); } }
  return <div><button className="ui-button ui-button-secondary" type="button" disabled={busy} onClick={() => void openPortal()}>{busy ? "Opening…" : "Manage subscription"}</button>{error && <p className="ui-error" role="alert">{error}</p>}</div>;
}
