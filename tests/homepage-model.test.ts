import { describe, expect, it } from "vitest";

import {
  buildConstellationNodes,
  buildHomepageEntries
} from "@/lib/archive/homepage";
import type { PublishedEssayRecord } from "@/lib/archive/types";

const record: PublishedEssayRecord = {
  slug: "2026-04-19-duty-kant-promise",
  dateKey: "2026-04-19",
  title: "When a promise survives the world that made it",
  subtitle: "A changed situation does not automatically dissolve what was owed.",
  hook: "A promise seems to bind us across time. But its moral grip becomes unstable when the circumstances that once made it intelligible have altered beyond recognition.",
  sections: [
    {
      heading: "Section",
      content: "Content"
    }
  ],
  takeaways: ["One", "Two", "Three"],
  reflectionExercise: "Reflection",
  metadata: {
    topicId: "duty-kant-promise",
    cluster: "duty and obligation",
    thinkerOrExperiment: "Immanuel Kant",
    angle: "promise-keeping under changed conditions",
    behaviorLink: "moral accountability"
  },
  pdfUrl: "https://example.com/promise.pdf",
  pdfPathname: "essays/2026-04-19/promise.pdf",
  wordCount: 1420,
  sentAt: "2026-04-19T04:00:00.000Z"
};

describe("homepage view model", () => {
  it("builds editorial homepage entries from archive records", () => {
    const [entry] = buildHomepageEntries([record]);

    expect(entry.slug).toBe(record.slug);
    expect(entry.title).toBe(record.title);
    expect(entry.thinker).toBe("Immanuel Kant");
    expect(entry.problemLine).toContain("A promise seems to bind us across time.");
    expect(entry.dateLabel).toBe("April 19, 2026");
  });

  it("builds deterministic constellation nodes", () => {
    const entries = buildHomepageEntries([record]);
    const [node] = buildConstellationNodes(entries);

    expect(node.slug).toBe(record.slug);
    expect(node.label).toBe("Immanuel Kant");
    expect(node.cluster).toBe("duty and obligation");
    expect(node.x).toBeTypeOf("number");
    expect(node.y).toBeTypeOf("number");
  });
});
