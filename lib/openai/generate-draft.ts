import "server-only";

import OpenAI from "openai";

import { getConfig } from "@/lib/config";
import {
  buildTopicMetadata,
  DAILY_ESSAY_JSON_SCHEMA,
  DailyEssayDraftSchema,
  type DraftGenerationAttempt
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
    "This should read like a serious but accessible essay, closer to a strong magazine essay or literary philosophy column than to self-help content.",
    "The prose should be elegant, concrete, psychologically sharp, and intellectually honest.",
    "Avoid filler, motivational slogans, therapy-speak, vague uplift, fake citations, made-up studies, and generic blog phrasing.",
    "Connect one philosophical idea to real human behavior, ordinary moral choice, and self-examination.",
    "Name the selected thinker, school, or experiment in a way that actually explains its importance rather than merely mentioning it.",
    "Include at least one concrete everyday scene, habit, decision, or social situation.",
    "Section headings must be specific and evocative, not placeholders like 'What this means' or 'What to do today'.",
    "The essay should feel like it was written for a bright adult who wants depth, not simplification.",
    "The conclusion should offer practical moral clarity without sounding preachy or simplistic.",
    "Target about 1400 to 1700 words total across the hook, sections, takeaways, and reflection.",
    `Use this title seed as the center of gravity for the essay: ${topic.titleSeed}`,
    `Topic id: ${topic.id}`,
    `Cluster: ${topic.cluster}`,
    `Thinker or experiment: ${topic.thinkerOrExperiment}`,
    `Angle: ${topic.angle}`,
    `Behavior link: ${topic.behaviorLink}`,
    `Practical direction: ${topic.practicalDirection}`,
    `Tags: ${topic.tags.join(", ")}`,
    `Metadata must exactly match: ${JSON.stringify(buildTopicMetadata(topic))}`,
    "Draft structure guidance:",
    "1. Open with a concrete human tension, not abstract throat-clearing.",
    "2. Clarify the philosophical idea and why it matters.",
    "3. Bring in the selected thinker, school, or experiment with real explanation.",
    "4. Connect it to present-day conduct, habits, relationships, institutions, or social behavior.",
    "5. End with a practical but unsentimental exercise for the day."
  ].join("\n");
}

function extractRawText(response: RawModelResponse) {
  if (!response.output_text) {
    throw new Error("OpenAI response did not include output_text");
  }

  return response.output_text.trim();
}

export async function generateDraft(topic: TopicSeed): Promise<DraftGenerationAttempt> {
  const response = (await getOpenAIClient().responses.create({
    model: getConfig().OPENAI_MODEL,
    reasoning: { effort: "medium" },
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
      ok: true,
      draft,
      openaiRequestId: response._request_id ?? null,
      repairOpenaiRequestId: null,
      rawOutput
    };
  } catch (error) {
    return {
      ok: false,
      errorCode: "validation_failed",
      message:
        error instanceof Error ? error.message : "Structured output validation failed",
      rawOutput,
      openaiRequestId: response._request_id ?? null
    };
  }
}
