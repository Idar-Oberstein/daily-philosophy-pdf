import { describe, expect, it } from "vitest";

import { getDraftWordCount, normalizeEssayDraft } from "@/lib/content/normalize-length";
import type { DailyEssayDraft } from "@/lib/openai/schema";

function buildDraft(sectionBody: string): DailyEssayDraft {
  return {
    title: "Practicing honesty under social pressure",
    subtitle: "Why small evasions shape character before they shape outcomes",
    hook:
      "The hardest truths are often small enough to disguise as politeness, convenience, or timing. That is why honesty is usually lost in ordinary moments before it is lost in dramatic ones.",
    sections: [
      {
        heading: "The first compromise",
        purpose: "Explain how dishonesty begins in modest self-protective edits.",
        body: sectionBody
      },
      {
        heading: "What this trains",
        purpose: "Connect the behavior to wider habits of conduct.",
        body: sectionBody
      },
      {
        heading: "What to do today",
        purpose: "Turn the idea into action.",
        body: sectionBody
      }
    ],
    takeaways: [
      "Small evasions teach the mind that comfort outranks clarity.",
      "Truthfulness is a habit of respect as much as a habit of speech.",
      "The practical question is what kind of person repetition is forming."
    ],
    reflectionExercise:
      "Name one conversation in which you are tempted to manage an impression. Before it happens, decide what accurate, non-cruel sentence you want to say instead.",
    metadata: {
      topicId: "honesty-self-deception",
      cluster: "honesty and deception",
      thinkerOrExperiment: "Moral psychology",
      angle: "Self-deception often comes before deception of others.",
      behaviorLink: "Tiny evasions normalize later dishonesty."
    }
  };
}

describe("normalizeEssayDraft", () => {
  it("reduces overly long drafts", () => {
    const body = new Array(420).fill("word").join(" ");
    const result = normalizeEssayDraft(buildDraft(body));
    expect(result.wordCount).toBeLessThanOrEqual(1700);
  });

  it("expands short drafts", () => {
    const body = new Array(90).fill("word").join(" ");
    const result = normalizeEssayDraft(buildDraft(body));
    expect(result.wordCount).toBeGreaterThanOrEqual(1300);
    expect(getDraftWordCount(result.draft)).toBe(result.wordCount);
  });
});
