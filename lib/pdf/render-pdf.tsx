import "server-only";

import { renderToBuffer } from "@react-pdf/renderer";

import type { DailyEssayDraft } from "@/lib/openai/schema";
import { EssayDocument } from "@/lib/pdf/essay-document";

export async function renderEssayPdf(
  draft: DailyEssayDraft,
  options: {
    dateLabel: string;
    wordCount: number;
  }
) {
  return renderToBuffer(
    <EssayDocument
      draft={draft}
      dateLabel={options.dateLabel}
      wordCount={options.wordCount}
    />
  );
}
