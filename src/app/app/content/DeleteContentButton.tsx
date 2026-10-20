"use client";

import { useState } from "react";

export function DeleteContentButton({ id, action }: { id: string; action: (formData: FormData) => void | Promise<void> }) {
  const [confirming, setConfirming] = useState(false);
  if (confirming) return <form action={action} className="workspace-actions"><input type="hidden" name="id" value={id} /><button className="ui-button ui-button-secondary" type="button" onClick={() => setConfirming(false)}>Keep it</button><button className="ui-button ui-button-primary" type="submit">Confirm delete</button></form>;
  return <button className="ui-button ui-button-secondary" type="button" onClick={() => setConfirming(true)}>Delete</button>;
}
