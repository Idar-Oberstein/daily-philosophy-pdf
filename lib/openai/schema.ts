import { z } from "zod";

import type { TopicSeed } from "@/lib/topics/types";

export const DailyEssaySectionSchema = z.object({
  heading: z.string().min(5).max(120),
  purpose: z.string().min(20).max(200),
  body: z.string().min(120).max(1200)
});

export const DailyEssayMetadataSchema = z.object({
  topicId: z.string().min(1),
  cluster: z.string().min(1),
  thinkerOrExperiment: z.string().min(1),
  angle: z.string().min(1),
  behaviorLink: z.string().min(1)
});

export const DailyEssayDraftSchema = z.object({
  title: z.string().min(8).max(120),
  subtitle: z.string().min(12).max(180),
  hook: z.string().min(80).max(500),
  sections: z.array(DailyEssaySectionSchema).min(3).max(5),
  takeaways: z.array(z.string().min(20).max(200)).min(3).max(5),
  reflectionExercise: z.string().min(60).max(400),
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
    title: { type: "string", minLength: 8, maxLength: 120 },
    subtitle: { type: "string", minLength: 12, maxLength: 180 },
    hook: { type: "string", minLength: 80, maxLength: 500 },
    sections: {
      type: "array",
      minItems: 3,
      maxItems: 5,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["heading", "purpose", "body"],
        properties: {
          heading: { type: "string", minLength: 5, maxLength: 120 },
          purpose: { type: "string", minLength: 20, maxLength: 200 },
          body: { type: "string", minLength: 120, maxLength: 1200 }
        }
      }
    },
    takeaways: {
      type: "array",
      minItems: 3,
      maxItems: 5,
      items: {
        type: "string",
        minLength: 20,
        maxLength: 200
      }
    },
    reflectionExercise: { type: "string", minLength: 60, maxLength: 400 },
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
  draft: DailyEssayDraft;
  openaiRequestId: string | null;
  repairOpenaiRequestId: string | null;
  rawOutput: string;
};

export class StructuredOutputValidationError extends Error {
  rawOutput: string;
  openaiRequestId: string | null;

  constructor(message: string, options: { rawOutput: string; openaiRequestId: string | null }) {
    super(message);
    this.name = "StructuredOutputValidationError";
    this.rawOutput = options.rawOutput;
    this.openaiRequestId = options.openaiRequestId;
  }
}

export function buildTopicMetadata(topic: TopicSeed) {
  return {
    topicId: topic.id,
    cluster: topic.cluster,
    thinkerOrExperiment: topic.thinkerOrExperiment,
    angle: topic.angle,
    behaviorLink: topic.behaviorLink
  };
}
