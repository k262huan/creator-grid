"use client";

import { useState } from "react";

export function DeleteAccountControl() {
  const [value, setValue] = useState(""); const [status, setStatus] = useState(""); const [busy, setBusy] = useState(false);
  async function submit() { if (value !== "DELETE MY ACCOUNT") { setStatus("Type DELETE MY ACCOUNT exactly to continue."); return; } setBusy(true); setStatus(""); try { const response = await fetch("/api/account/delete", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ confirmation: value }) }); const data = await response.json(); setStatus(data.error ?? data.status ?? "Request submitted"); if (data.status === "completed") window.location.href = "/"; } catch { setStatus("The deletion request could not be completed. Try again later."); } finally { setBusy(false); } }
  return <div className="editor-form"><label className="ui-label">Confirmation phrase<TextInput value={value} onChange={(event) => setValue(event.target.value)} placeholder="DELETE MY ACCOUNT" /></label><button className="ui-button ui-button-secondary" type="button" disabled={busy} onClick={() => void submit()}>{busy ? "Processing…" : "Request account deletion"}</button>{status && <p role="status">{status}</p>}</div>;
}

function TextInput({ value, onChange, placeholder }: { value: string; onChange: (event: React.ChangeEvent<HTMLInputElement>) => void; placeholder: string }) { return <input className="ui-input" value={value} onChange={onChange} placeholder={placeholder} />; }
