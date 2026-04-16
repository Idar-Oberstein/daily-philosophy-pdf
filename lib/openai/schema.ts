import { z } from "zod";

import type { TopicSeed } from "@/lib/topics/types";

export const DailyEssaySectionSchema = z.object({
  heading: z.string().min(3).max(120),
  purpose: z.string().min(8).max(200),
  body: z.string().min(40).max(1200)
});

export const DailyEssayMetadataSchema = z.object({
  topicId: z.string().min(1),
  cluster: z.string().min(1),
  thinkerOrExperiment: z.string().min(1),
  angle: z.string().min(1),
  behaviorLink: z.string().min(1)
});

export const DailyEssayDraftSchema = z.object({
  title: z.string().min(4).max(120),
  subtitle: z.string().min(8).max(180),
  hook: z.string().min(24).max(500),
  sections: z.array(DailyEssaySectionSchema).min(3).max(5),
  takeaways: z.array(z.string().min(8).max(200)).min(3).max(5),
  reflectionExercise: z.string().min(24).max(400),
  metadata: DailyEssayMetadataSchema
});

export type DailyEssayDraft = z.infer<typeof DailyEssayDraftSchema>;

export const DAILY_ESSAY_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "title",
    "subtitle",
    "hook",
    "sections",
    "takeaways",
    "reflectionExercise",
    "metadata"
  ],
  properties: {
    title: { type: "string", minLength: 4, maxLength: 120 },
    subtitle: { type: "string", minLength: 8, maxLength: 180 },
    hook: { type: "string", minLength: 24, maxLength: 500 },
    sections: {
      type: "array",
      minItems: 3,
      maxItems: 5,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["heading", "purpose", "body"],
        properties: {
          heading: { type: "string", minLength: 3, maxLength: 120 },
          purpose: { type: "string", minLength: 8, maxLength: 200 },
          body: { type: "string", minLength: 40, maxLength: 1200 }
        }
      }
    },
    takeaways: {
      type: "array",
      minItems: 3,
      maxItems: 5,
      items: {
        type: "string",
        minLength: 8,
        maxLength: 200
      }
    },
    reflectionExercise: { type: "string", minLength: 24, maxLength: 400 },
    metadata: {
      type: "object",
      additionalProperties: false,
      required: ["topicId", "cluster", "thinkerOrExperiment", "angle", "behaviorLink"],
      properties: {
        topicId: { type: "string", minLength: 1 },
        cluster: { type: "string", minLength: 1 },
        thinkerOrExperiment: { type: "string", minLength: 1 },
        angle: { type: "string", minLength: 1 },
        behaviorLink: { type: "string", minLength: 1 }
      }
    }
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
