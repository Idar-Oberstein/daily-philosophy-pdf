import { describe, expect, it } from "vitest";

import { selectTopic } from "@/lib/topics/select-topic";

describe("selectTopic", () => {
  it("avoids selecting the exact most recent topic when alternatives exist", () => {
    const selected = selectTopic([
      {
        dateKey: "2026-04-16",
        title: "Yesterday",
        topicId: "virtue-habits-aristotle",
        cluster: "virtue and character",
        model: "gpt-5.4-mini",
        sentAt: "2026-04-16T05:00:00.000Z",
        status: "sent",
        openaiRequestId: "req_1",
        repairOpenaiRequestId: null,
        resendEmailId: "email_1",
        wordCount: 1450
      }
    ]);

    expect(selected.id).not.toBe("virtue-habits-aristotle");
  });
});
