"use client";

import { useState } from "react";

export function AssetActions({ assetId, contentItemId, canDelete, isAssociated }: { assetId: string; contentItemId?: string; canDelete: boolean; isAssociated: boolean }) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function request(method: "POST" | "DELETE", url: string, body: unknown) {
    setBusy(true); setMessage("");
    try { const response = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); const data = await response.json(); if (!response.ok) throw new Error(data.error ?? "Asset action failed"); setMessage(method === "DELETE" ? "Removed" : "Associated"); window.location.reload(); } catch (error) { setMessage(error instanceof Error ? error.message : "Asset action failed"); } finally { setBusy(false); }
  }
  return <div className="workspace-actions"><button className="ui-button ui-button-secondary" type="button" disabled={busy || !contentItemId} onClick={() => contentItemId && void request(isAssociated ? "DELETE" : "POST", "/api/content-assets", { contentItemId, assetId })}>{busy ? "Working…" : isAssociated ? "Remove" : "Associate"}</button>{canDelete && <button className="ui-button ui-button-secondary" type="button" disabled={busy} onClick={() => { if (window.confirm("Delete this asset permanently?")) void request("DELETE", `/api/assets/${assetId}`, {}); }}>Delete</button>}{message && <span role="status">{message}</span>}</div>;
}
