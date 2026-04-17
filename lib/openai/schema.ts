import { z } from "zod";

import type { TopicSeed } from "@/lib/topics/types";

export const ModelEssaySectionSchema = z.object({
  heading: z.string().min(3).max(120),
  content: z.string().min(120).max(2200)
});

export const ModelEssayDraftSchema = z.object({
  title: z.string().min(8).max(140),
  subtitle: z.string().min(12).max(220),
  hook: z.string().min(80).max(1200),
  sections: z.array(ModelEssaySectionSchema).min(3).max(5),
  takeaways: z.array(z.string().min(20).max(260)).length(3),
  reflection_exercise: z.string().min(60).max(500)
});

export const DailyEssayMetadataSchema = z.object({
  topicId: z.string().min(1),
  cluster: z.string().min(1),
  thinkerOrExperiment: z.string().min(1),
  angle: z.string().min(1),
  behaviorLink: z.string().min(1)
});

export const DailyEssaySectionSchema = z.object({
  heading: z.string().min(3).max(120),
  content: z.string().min(120).max(2200)
});

export const DailyEssayDraftSchema = z.object({
  title: z.string().min(8).max(140),
  subtitle: z.string().min(12).max(220),
  hook: z.string().min(80).max(1200),
  sections: z.array(DailyEssaySectionSchema).min(3).max(5),
  takeaways: z.array(z.string().min(20).max(260)).length(3),
  reflectionExercise: z.string().min(60).max(500),
  metadata: DailyEssayMetadataSchema
});

export type ModelEssayDraft = z.infer<typeof ModelEssayDraftSchema>;
export type DailyEssayDraft = z.infer<typeof DailyEssayDraftSchema>;

export const MODEL_ESSAY_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "title",
    "subtitle",
    "hook",
    "sections",
    "takeaways",
    "reflection_exercise"
  ],
  properties: {
    title: { type: "string", minLength: 8, maxLength: 140 },
    subtitle: { type: "string", minLength: 12, maxLength: 220 },
    hook: { type: "string", minLength: 80, maxLength: 1200 },
    sections: {
      type: "array",
      minItems: 3,
      maxItems: 5,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["heading", "content"],
        properties: {
          heading: { type: "string", minLength: 3, maxLength: 120 },
          content: { type: "string", minLength: 120, maxLength: 2200 }
        }
      }
    },
    takeaways: {
      type: "array",
      minItems: 3,
      maxItems: 3,
      items: {
        type: "string",
        minLength: 20,
        maxLength: 260
      }
    },
    reflection_exercise: { type: "string", minLength: 60, maxLength: 500 }
  }
} as const;

export type GeneratedDraftResult = {
  ok: true;
  draft: DailyEssayDraft;
  openaiRequestId: string | null;
  repairOpenaiRequestId: string | null;
  rawOutput: string;
};

export type ValidationFailureResult = {
  ok: false;
  errorCode: "validation_failed";
  message: string;
  rawOutput: string;
  openaiRequestId: string | null;
};

export type DraftGenerationAttempt = GeneratedDraftResult | ValidationFailureResult;

export function buildTopicMetadata(topic: TopicSeed) {
  return {
    topicId: topic.id,
    cluster: topic.cluster,
    thinkerOrExperiment: topic.thinkerOrExperiment,
    angle: topic.angle,
    behaviorLink: topic.behaviorLink
  };
}

export function attachMetadataToDraft(
  draft: ModelEssayDraft,
  topic: TopicSeed
): DailyEssayDraft {
  return DailyEssayDraftSchema.parse({
    title: draft.title,
    subtitle: draft.subtitle,
    hook: draft.hook,
    sections: draft.sections,
    takeaways: draft.takeaways,
    reflectionExercise: draft.reflection_exercise,
    metadata: buildTopicMetadata(topic)
  });
}
