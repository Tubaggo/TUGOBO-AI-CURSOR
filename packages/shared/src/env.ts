import { z } from "zod";

const envSchema = z.object({
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

  // OpenAI
  OPENAI_API_KEY: z.string().min(1),

  /** DeepSeek (OpenAI-compatible API) — server-only; never NEXT_PUBLIC_ */
  DEEPSEEK_API_KEY: z.string().min(1).optional(),
  /** Override only if DeepSeek provides a different base URL for your account */
  DEEPSEEK_BASE_URL: z.string().url().optional(),

  // Twilio (week 1)
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_WHATSAPP_NUMBER: z.string().optional(),

  // Meta WhatsApp Cloud API (week 2)
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
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
});

export type Env = z.infer<typeof envSchema>;

function getEnv(): Env {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error("Invalid environment variables:", result.error.format());
    throw new Error("Invalid environment variables. Check .env.local");
  }
  return result.data;
}

export const env = getEnv();
