import { describe, expect, it } from "vitest";

import { composeEssayEmail } from "@/lib/email/compose-email";
import type { DailyEssayDraft } from "@/lib/openai/schema";

const draft: DailyEssayDraft = {
  title: "Why promises become morally unstable when the world changes around them",
  subtitle: "A promise can remain binding even when its original setting has quietly dissolved.",
  hook: "Promises seem to bind us across time, but the force of a promise depends on conditions that time often erodes. The real question is not whether promises matter, but what exactly survives when the circumstances that once made them intelligible have changed.",
  sections: [
    {
      heading: "The problem",
      content: "A promise does not only bind a speaker to a future act. It also stabilizes an expectation in another person."
    },
    {
      heading: "The frame",
      content: "Kant treats promising as part of a moral world in which words can be relied upon."
    },
    {
      heading: "The complication",
      content: "But changed conditions can alter the meaning of performance without eliminating the original duty."
    }
  ],
  takeaways: [
    "Promises do not lose their force merely because they become inconvenient.",
    "Changed circumstances can alter what fidelity requires without canceling accountability.",
    "The hard task is to distinguish reinterpretation from self-serving escape."
  ],
  reflectionExercise: "Think of one standing obligation in your life whose meaning has shifted. Ask whether you still owe the same act, or whether you now owe a more honest renegotiation.",
  metadata: {
    topicId: "duty-promise-change",
    cluster: "duty and obligation",
    thinkerOrExperiment: "Immanuel Kant",
    angle: "promise-keeping under changed conditions",
    behaviorLink: "moral accountability"
  }
};

describe("composeEssayEmail", () => {
  it("builds a branded production email with html and text", () => {
    const email = composeEssayEmail({
      draft,
      dateKey: "2026-04-17",
      testRun: false,
      archiveUrl: "https://example.com/archive"
    });

    expect(email.subject).toBe(`Philo-Snacks | ${draft.title}`);
    expect(email.text).toContain("Philo-Snacks");
    expect(email.text).toContain("by Raphael Cullmann");
    expect(email.text).toContain("Your morning essay is attached as a PDF.");
    expect(email.text).toContain("Public archive: https://example.com/archive");
    expect(email.html).toContain("Visit the archive");
    expect(email.html).toContain(draft.title);
  });

  it("marks manual tests clearly", () => {
    const email = composeEssayEmail({
      draft,
      dateKey: "2026-04-17",
      testRun: true,
      archiveUrl: "https://example.com/archive"
    });

    expect(email.subject).toBe(`Philo-Snacks Test | ${draft.title}`);
    expect(email.text).toContain("manual test run");
    expect(email.text).toContain("not published to the public archive");
  });
});
