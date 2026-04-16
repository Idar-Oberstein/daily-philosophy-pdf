import "server-only";

import OpenAI from "openai";

import { getConfig } from "@/lib/config";
import {
  DAILY_ESSAY_JSON_SCHEMA,
  DailyEssayDraftSchema,
  type DailyEssayDraft
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

export async function refineDraft(params: {
  draft: DailyEssayDraft;
  topic: TopicSeed;
}): Promise<{
  ok: true;
  draft: DailyEssayDraft;
  openaiRequestId: string | null;
  rawOutput: string;
} | {
  ok: false;
  message: string;
  openaiRequestId: string | null;
}> {
  const response = (await getOpenAIClient().responses.create({
    model: getConfig().OPENAI_MODEL,
    reasoning: { effort: "medium" },
    input: [
      "Rewrite and strengthen this structured philosophy essay while preserving the same JSON schema and the same metadata.",
      "Keep the subject and core idea, but improve the language, specificity, philosophical sharpness, and readability.",
      "Make it feel less generic, less blog-like, and less like self-help.",
      "Use clearer argumentative movement, more concrete examples, and more memorable phrasing.",
      "Do not add fake citations or claims of research you cannot support.",
      "Do not become academic or jargon-heavy.",
      "Keep the tone calm, thoughtful, precise, and humane.",
      "Keep the writing practical, but avoid moralizing clichés.",
      `Title seed: ${params.topic.titleSeed}`,
      `Selected thinker or experiment: ${params.topic.thinkerOrExperiment}`,
      `Angle: ${params.topic.angle}`,
      `Behavior link: ${params.topic.behaviorLink}`,
      `Practical direction: ${params.topic.practicalDirection}`,
      "Return only valid JSON for the same schema.",
      JSON.stringify(params.draft)
    ].join("\n\n"),
    text: {
      format: {
        type: "json_schema",
        name: "daily_philosophy_essay",
        schema: DAILY_ESSAY_JSON_SCHEMA,
        strict: true
      }
    }
  })) as RawModelResponse;

  const rawOutput = response.output_text?.trim();
  if (!rawOutput) {
    return {
      ok: false,
      message: "Refinement response did not include output_text",
      openaiRequestId: response._request_id ?? null
    };
  }

  try {
    const parsed = JSON.parse(rawOutput);
    const draft = DailyEssayDraftSchema.parse(parsed);

    return {
      ok: true,
      draft,
      openaiRequestId: response._request_id ?? null,
      rawOutput
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Draft refinement failed",
      openaiRequestId: response._request_id ?? null
    };
  }
}
