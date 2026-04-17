import type { DailyEssayDraft } from "@/lib/openai/schema";

export type PublishedEssayRecord = {
  slug: string;
  dateKey: string;
  title: string;
  subtitle: string;
  hook: string;
  sections: DailyEssayDraft["sections"];
  takeaways: DailyEssayDraft["takeaways"];
  reflectionExercise: string;
  metadata: DailyEssayDraft["metadata"];
  pdfUrl: string;
  pdfPathname: string;
  wordCount: number;
  sentAt: string;
};
