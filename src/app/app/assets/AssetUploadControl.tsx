"use client";

import { useState } from "react";

export function AssetUploadControl({ workspaceId }: { workspaceId: string }) {
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  async function upload(file: File) {
    setSelectedFile(file);
    setStatus("uploading");
    setProgress(0);
    setMessage("");
    try {
      const authResponse = await fetch("/api/assets/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId, mimeType: file.type, fileSizeBytes: file.size }),
      });
      if (!authResponse.ok) throw new Error((await authResponse.json()).error ?? "Could not authorize upload");
      const auth = await authResponse.json();
      const form = new FormData();
      form.append("file", file);
      form.append("fileName", file.name);
      form.append("publicKey", auth.publicKey);
      form.append("token", auth.token);
      form.append("expire", String(auth.expire));
      form.append("signature", auth.signature);
      form.append("folder", auth.folder);

      const result = await new Promise<{ fileId: string; url: string }>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "https://upload.imagekit.io/api/v1/files/upload");
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) setProgress(Math.round((event.loaded / event.total) * 100));
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const body = JSON.parse(xhr.responseText) as { fileId?: string; url?: string };
            if (body.fileId && body.url) resolve({ fileId: body.fileId, url: body.url });
            else reject(new Error("ImageKit returned incomplete metadata"));
          } else reject(new Error("ImageKit upload failed"));
        };
        xhr.onerror = () => reject(new Error("Network error during upload"));
        xhr.send(form);
      });

      const metadataResponse = await fetch("/api/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId, imagekitFileId: result.fileId, fileName: file.name, fileUrl: result.url, mimeType: file.type, fileSizeBytes: file.size }),
      });
      if (!metadataResponse.ok) throw new Error((await metadataResponse.json()).error ?? "Could not save asset metadata");
      setProgress(100);
      setStatus("success");
      setMessage("Upload complete");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Upload failed");
    }
  }

  return (
    <section>
      <label>
        Upload an asset
        <input type="file" disabled={status === "uploading"} onChange={(event) => { const file = event.target.files?.[0]; if (file) void upload(file); }} />
      </label>
      {status === "uploading" && <p role="status">Uploading: {progress}%</p>}
      {message && <p role={status === "error" ? "alert" : "status"}>{message}</p>}
      {status === "error" && selectedFile && <button type="button" onClick={() => void upload(selectedFile)}>Retry upload</button>}
    </section>
  );
}
