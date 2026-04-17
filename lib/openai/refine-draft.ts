import "server-only";

import OpenAI from "openai";

import { getConfig } from "@/lib/config";
import { retrieveLibraryContext } from "@/lib/library/retrieve";
import {
  attachMetadataToDraft,
  MODEL_ESSAY_JSON_SCHEMA,
  ModelEssayDraftSchema,
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
}): Promise<
  | {
      ok: true;
      draft: DailyEssayDraft;
      openaiRequestId: string | null;
      rawOutput: string;
    }
  | {
      ok: false;
      message: string;
      openaiRequestId: string | null;
    }
> {
  const libraryContext = await retrieveLibraryContext(params.topic);

  const response = (await getOpenAIClient().responses.create({
    model: getConfig().OPENAI_MODEL,
    reasoning: { effort: "medium" },
    input: [
      "Revise this philosophical essay using the same curated philosophy library as the primary source base.",
      "Do not make it friendlier. Make it more exact, more rigorous, and more alive.",
      "Remove any trace of self-help tone, blog voice, motivational framing, empty uplift, or soft moral language.",
      "Preserve the central problem, but sharpen the line of argument, the conceptual distinctions, and the conflict.",
      "Keep at least one real disagreement or unresolved tension alive.",
      "Do not smooth everything into agreement.",
      "Make at least one opposing pressure feel genuinely dangerous to the essay's main claim.",
      "If the current moral psychology is vague, replace vague empirical language with a cleaner mechanism such as reciprocity pressure, status anxiety, motivated blindness, or norm drift.",
      "Make the ending less conciliatory and more intellectually irreversible.",
      "The takeaways must read like compressed conclusions, not advice.",
      "The reflection exercise must read like a disciplined challenge, not journaling guidance.",
      "Use the source packets below to strengthen the essay's epistemic grounding.",
      "Return only valid JSON for the same schema.",
      `Selected topic: ${params.topic.titleSeed}`,
      `Thinker or experiment anchor: ${params.topic.thinkerOrExperiment}`,
      `Working angle: ${params.topic.angle}`,
      "",
      "SOURCE PACKETS",
      libraryContext.sourceNotes,
      "",
      "CURRENT DRAFT",
      JSON.stringify({
        title: params.draft.title,
        subtitle: params.draft.subtitle,
        hook: params.draft.hook,
        sections: params.draft.sections,
        takeaways: params.draft.takeaways,
        reflection_exercise: params.draft.reflectionExercise
      })
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
    return {
      ok: false,
      message: "Refinement response did not include output_text",
      openaiRequestId: response._request_id ?? null
    };
  }

  try {
    const parsed = JSON.parse(rawOutput);
    const modelDraft = ModelEssayDraftSchema.parse(parsed);
    const draft = attachMetadataToDraft(modelDraft, params.topic);

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
