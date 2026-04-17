import "server-only";

import { ZodError, z } from "zod";

const EnvSchema = z.object({
  OPENAI_API_KEY: z.string().min(1),
  OPENAI_MODEL: z.string().default("gpt-5.4-mini"),
  RESEND_API_KEY: z.string().min(1),
  RESEND_FROM_EMAIL: z.string().min(1),
  DAILY_ESSAY_TO_EMAIL: z.string().email(),
  CRON_SECRET: z.string().min(32),
  UPSTASH_REDIS_REST_URL: z.string().url(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1),
  BLOB_READ_WRITE_TOKEN: z.string().min(1).optional()
});

export type AppConfig = z.infer<typeof EnvSchema>;

let cachedConfig: AppConfig | null = null;
let cachedError: ZodError | null = null;

export function getConfigResult() {
  if (cachedConfig) {
    return {
      ok: true as const,
      config: cachedConfig
    };
  }

  if (cachedError) {
    return {
      ok: false as const,
      error: cachedError
    };
  }

  const result = EnvSchema.safeParse(process.env);
  if (result.success) {
    cachedConfig = result.data;
    return {
      ok: true as const,
      config: cachedConfig
    };
  }

  cachedError = result.error;
  return {
    ok: false as const,
    error: cachedError
  };
}

export function getConfig(): AppConfig {
  const result = getConfigResult();
  if (result.ok) {
    return result.config;
  }

  throw result.error;
}
