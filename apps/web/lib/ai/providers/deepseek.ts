import type { AiProviderName } from "../types";
import type { ProviderCompletionInput, ProviderCompletionResult } from "./openai";

const DEEPSEEK_DEFAULT_BASE = "https://api.deepseek.com";

export async function completeWithDeepSeek(
  input: ProviderCompletionInput,
  apiKey: string,
  model: string,
  baseUrl?: string
): Promise<ProviderCompletionResult> {
  const base = (baseUrl ?? DEEPSEEK_DEFAULT_BASE).replace(/\/$/, "");

  const res = await fetch(`${base}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: input.system },
        { role: "user", content: input.user },
      ],
      response_format: { type: "json_object" },
      temperature: 0.35,
      max_tokens: 1024,
    }),
  });

  if (!res.ok) {
    throw new Error(`deepseek_http_${res.status}`);
  }

  const upstream = (await res.json()) as {
    choices?: Array<{ message?: { content?: string | null } }>;
  };
  const raw = upstream.choices?.[0]?.message?.content;
  if (!raw?.trim()) {
    throw new Error("empty_deepseek_completion");
  }

  return { raw: raw.trim(), provider: "deepseek" as AiProviderName, model };
}

export function isDeepSeekConfigured(apiKey: string | undefined): boolean {
  return Boolean(apiKey?.trim());
}
