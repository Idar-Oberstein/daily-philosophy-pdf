import "server-only";

import OpenAI from "openai";

import { getConfig } from "@/lib/config";
import {
  buildTopicMetadata,
  DAILY_ESSAY_JSON_SCHEMA,
  DailyEssayDraftSchema,
  StructuredOutputValidationError,
  type GeneratedDraftResult
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

function buildGenerationPrompt(topic: TopicSeed) {
  return [
    "Write a daily philosophy essay as structured JSON for an intelligent general reader.",
    "Use the target schema exactly.",
    "The essay must feel thoughtful, clear, readable, reflective, and practical.",
    "Avoid dry academic writing, generic self-help fluff, fake citations, and made-up studies.",
    "Connect one philosophical idea to real human behavior and everyday conduct.",
    "Include one reflection or experiment the reader can try today.",
    "Target about 1300 to 1700 words total across the hook, sections, takeaways, and reflection.",
    `Topic id: ${topic.id}`,
    `Cluster: ${topic.cluster}`,
    `Thinker or experiment: ${topic.thinkerOrExperiment}`,
    `Angle: ${topic.angle}`,
    `Behavior link: ${topic.behaviorLink}`,
    `Practical direction: ${topic.practicalDirection}`,
    `Tags: ${topic.tags.join(", ")}`,
    `Metadata must exactly match: ${JSON.stringify(buildTopicMetadata(topic))}`
  ].join("\n");
}

function extractRawText(response: RawModelResponse) {
  if (!response.output_text) {
    throw new Error("OpenAI response did not include output_text");
  }

  return response.output_text.trim();
}

export async function generateDraft(topic: TopicSeed): Promise<GeneratedDraftResult> {
  const response = (await getOpenAIClient().responses.create({
    model: getConfig().OPENAI_MODEL,
    reasoning: { effort: "low" },
    input: buildGenerationPrompt(topic),
    text: {
      format: {
        type: "json_schema",
        name: "daily_philosophy_essay",
        schema: DAILY_ESSAY_JSON_SCHEMA,
        strict: true
      }
    }
  })) as RawModelResponse;

  const rawOutput = extractRawText(response);
  try {
    const parsed = JSON.parse(rawOutput);
    const draft = DailyEssayDraftSchema.parse(parsed);

    return {
      draft,
      openaiRequestId: response._request_id ?? null,
      repairOpenaiRequestId: null,
      rawOutput
    };
  } catch (error) {
    throw new StructuredOutputValidationError(
      error instanceof Error ? error.message : "Structured output validation failed",
      {
        rawOutput,
        openaiRequestId: response._request_id ?? null
      }
    );
  }
}
