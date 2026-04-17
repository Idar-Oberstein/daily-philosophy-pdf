import "server-only";

import OpenAI from "openai";
import { ZodError } from "zod";

import { getConfig } from "@/lib/config";
import {
  attachMetadataToDraft,
  MODEL_ESSAY_JSON_SCHEMA,
  ModelEssayDraftSchema,
  type DailyEssayDraft,
  type ValidationFailureResult
} from "@/lib/openai/schema";
import type { TopicSeed } from "@/lib/topics/types";

type RawModelResponse = {
  output_text?: string;
  _request_id?: string;
};

let client: OpenAI | null = null;

function getOpenAIClient() {
  if (client) {
    return client;
  }

  client = new OpenAI({
    apiKey: getConfig().OPENAI_API_KEY
  });

  return client;
}

function validationMessage(error: unknown) {
  if (error instanceof ZodError) {
    return JSON.stringify(error.flatten(), null, 2);
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown validation error";
}

export async function repairDraft(
  invalidOutput: string,
  error: unknown,
  topic: TopicSeed
): Promise<{
  ok: true;
  draft: DailyEssayDraft;
  repairOpenaiRequestId: string | null;
  rawOutput: string;
} | (ValidationFailureResult & {
  repairOpenaiRequestId: string | null;
})> {
  const response = (await getOpenAIClient().responses.create({
    model: getConfig().OPENAI_MODEL,
    reasoning: { effort: "low" },
    input: [
      "The prior response failed schema validation.",
      "Repair it against the same target schema.",
      "Preserve the philosophical content, but force the output into the exact schema.",
      "Return only valid JSON for that schema.",
      `Validation error summary:\n${validationMessage(error)}`,
      `Invalid JSON candidate:\n${invalidOutput}`
    ].join("\n\n"),
    text: {
      format: {
        type: "json_schema",
        name: "daily_philosophy_essay",
        schema: MODEL_ESSAY_JSON_SCHEMA,
        strict: true
      }
    }
  })) as RawModelResponse;

  const rawOutput = response.output_text?.trim();
  if (!rawOutput) {
    throw new Error("Schema repair response did not include output_text");
  }

  try {
    const parsed = JSON.parse(rawOutput);
    const modelDraft = ModelEssayDraftSchema.parse(parsed);
    const draft = attachMetadataToDraft(modelDraft, topic);

    return {
      ok: true,
      draft,
      repairOpenaiRequestId: response._request_id ?? null,
      rawOutput
    };
  } catch (repairError) {
    return {
      ok: false,
      errorCode: "validation_failed",
      message:
        repairError instanceof Error
          ? repairError.message
          : "Structured output repair validation failed",
      rawOutput,
      openaiRequestId: response._request_id ?? null,
      repairOpenaiRequestId: response._request_id ?? null
    };
  }
}
