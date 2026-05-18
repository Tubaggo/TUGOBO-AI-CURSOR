import OpenAI from "openai";
import type { AiProviderName } from "../types";

export type ProviderCompletionInput = {
  system: string;
  user: string;
};

export type ProviderCompletionResult = {
  raw: string;
  provider: AiProviderName;
  model: string;
};

export async function completeWithOpenAI(
  input: ProviderCompletionInput,
  apiKey: string,
  model: string
): Promise<ProviderCompletionResult> {
  const client = new OpenAI({ apiKey });
  const completion = await client.chat.completions.create({
    model,
    temperature: 0.35,
    max_tokens: 1024,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: input.system },
      { role: "user", content: input.user },
    ],
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw?.trim()) {
    throw new Error("empty_openai_completion");
  }

  return { raw: raw.trim(), provider: "openai", model };
}

export function isOpenAiConfigured(apiKey: string | undefined): boolean {
  return Boolean(apiKey?.trim());
}
