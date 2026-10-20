import "server-only";

import { getServerEnv } from "@/lib/env";

export type GeminiAction = "idea_generation" | "brief_drafting" | "title_hook_suggestions" | "caption_outline_drafting" | "text_refinement";

export class GeminiProviderError extends Error {
  constructor(public readonly kind: "quota" | "rate_limit" | "timeout" | "unavailable" | "malformed" | "provider") {
    super(`Gemini provider ${kind}`);
    this.name = "GeminiProviderError";
  }
}

const model = "gemini-2.0-flash";

export async function generateWithGemini(action: GeminiAction, prompt: string): Promise<string> {
  const env = getServerEnv();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20_000);
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(env.GEMINI_API_KEY)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: `Action: ${action}\nReturn concise editable plain text only.\n${prompt}` }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 800, responseMimeType: "text/plain" },
      }),
      signal: controller.signal,
    });
    if (response.status === 429) throw new GeminiProviderError("rate_limit");
    if (response.status === 401 || response.status === 403) throw new GeminiProviderError("quota");
    if (response.status === 404) throw new GeminiProviderError("unavailable");
    if (!response.ok) throw new GeminiProviderError("provider");
    const payload = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
    const text = payload.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("").trim();
    if (!text || text.length > 20_000) throw new GeminiProviderError("malformed");
    return text;
  } catch (error) {
    if (error instanceof GeminiProviderError) throw error;
    if (error instanceof Error && error.name === "AbortError") throw new GeminiProviderError("timeout");
    throw new GeminiProviderError("provider");
  } finally {
    clearTimeout(timer);
  }
}
