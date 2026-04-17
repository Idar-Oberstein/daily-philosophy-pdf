import type { DailyEssayDraft } from "@/lib/openai/schema";

export type PublishedEssayRecord = {
  slug: string;
  dateKey: string;
  title: string;
  subtitle: string;
  hook: string;
  sections: Array<{
    heading: string;
    content?: string;
    body?: string;
    purpose?: string;
  }>;
  takeaways: DailyEssayDraft["takeaways"];
  reflectionExercise: string;
  metadata: DailyEssayDraft["metadata"];
  pdfUrl: string;
  pdfPathname: string;
  wordCount: number;
  sentAt: string;
};
