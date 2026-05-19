import { z } from "zod";

const envSchema = z.object({
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),

  // OpenAI
  OPENAI_API_KEY: z.string().min(1).optional(),
  OPENAI_MODEL: z.string().optional(),
  AI_PROVIDER: z.enum(["openai", "deepseek"]).optional(),
  DEEPSEEK_MODEL: z.string().optional(),

  // DeepSeek
  DEEPSEEK_API_KEY: z.string().min(1).optional(),
  DEEPSEEK_BASE_URL: z.string().url().optional(),

  // Twilio
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_WHATSAPP_NUMBER: z.string().optional(),

  // Meta WhatsApp Cloud API
  META_WHATSAPP_PHONE_ID: z.string().optional(),
  META_WHATSAPP_TOKEN: z.string().optional(),
  META_WHATSAPP_VERIFY_TOKEN: z.string().optional(),

  // Inngest
  INNGEST_EVENT_KEY: z.string().optional(),
  INNGEST_SIGNING_KEY: z.string().optional(),

  // Langfuse
  LANGFUSE_PUBLIC_KEY: z.string().optional(),
  LANGFUSE_SECRET_KEY: z.string().optional(),
  LANGFUSE_HOST: z.string().optional(),

  // App
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

export type Env = z.infer<typeof envSchema>;

function normalizeEnv(input: NodeJS.ProcessEnv): Record<string, string | undefined> {
  return Object.fromEntries(
    Object.entries(input).map(([key, value]) => [key, typeof value === "string" && value.trim() === "" ? undefined : value])
  );
}

function getEnv(): Env {
  const normalized = normalizeEnv(process.env);
  const result = envSchema.safeParse(normalized);

  if (!result.success) {
    console.warn(
      "Environment variables are incomplete or invalid:",
      result.error.flatten().fieldErrors
    );

    const fallback = envSchema.partial().parse(normalized);
    return {
      NODE_ENV: fallback.NODE_ENV ?? "development",
      NEXT_PUBLIC_SUPABASE_URL: fallback.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: fallback.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: fallback.SUPABASE_SERVICE_ROLE_KEY,
      OPENAI_API_KEY: fallback.OPENAI_API_KEY,
      OPENAI_MODEL: fallback.OPENAI_MODEL,
      AI_PROVIDER: fallback.AI_PROVIDER,
      DEEPSEEK_MODEL: fallback.DEEPSEEK_MODEL,
      DEEPSEEK_API_KEY: fallback.DEEPSEEK_API_KEY,
      DEEPSEEK_BASE_URL: fallback.DEEPSEEK_BASE_URL,
      TWILIO_ACCOUNT_SID: fallback.TWILIO_ACCOUNT_SID,
      TWILIO_AUTH_TOKEN: fallback.TWILIO_AUTH_TOKEN,
      TWILIO_WHATSAPP_NUMBER: fallback.TWILIO_WHATSAPP_NUMBER,
      META_WHATSAPP_PHONE_ID: fallback.META_WHATSAPP_PHONE_ID,
      META_WHATSAPP_TOKEN: fallback.META_WHATSAPP_TOKEN,
      META_WHATSAPP_VERIFY_TOKEN: fallback.META_WHATSAPP_VERIFY_TOKEN,
      INNGEST_EVENT_KEY: fallback.INNGEST_EVENT_KEY,
      INNGEST_SIGNING_KEY: fallback.INNGEST_SIGNING_KEY,
      LANGFUSE_PUBLIC_KEY: fallback.LANGFUSE_PUBLIC_KEY,
      LANGFUSE_SECRET_KEY: fallback.LANGFUSE_SECRET_KEY,
      LANGFUSE_HOST: fallback.LANGFUSE_HOST,
      NEXT_PUBLIC_APP_URL: fallback.NEXT_PUBLIC_APP_URL,
    };
  }

  return result.data;
}

export const env = getEnv();
