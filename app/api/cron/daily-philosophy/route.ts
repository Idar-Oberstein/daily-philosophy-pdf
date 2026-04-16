import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { normalizeEssayDraft } from "@/lib/content/normalize-length";
import { isAuthorizedCronRequest } from "@/lib/cron-auth";
import { sendEssayEmail } from "@/lib/email/send-email";
import { logError, logInfo, logWarn } from "@/lib/logging";
import { generateDraft } from "@/lib/openai/generate-draft";
import { repairDraft } from "@/lib/openai/repair-draft";
import {
  StructuredOutputValidationError,
  type GeneratedDraftResult
} from "@/lib/openai/schema";
import { renderEssayPdf } from "@/lib/pdf/render-pdf";
import {
  acquireSendLock,
  hasSuccessfulSend,
  markSuccessfulSend,
  releaseSendLock,
  writeFailureRecord,
  type SendRecord
} from "@/lib/store/send-state";
import { appendSendHistory, getRecentSendHistory } from "@/lib/store/topic-history";
import { selectTopic } from "@/lib/topics/select-topic";

export const runtime = "nodejs";
export const maxDuration = 120;
export const dynamic = "force-dynamic";

function dateKeyFromNow() {
  return new Date().toISOString().slice(0, 10);
}

function formatDateLabel(dateKey: string) {
  return new Date(`${dateKey}T00:00:00.000Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC"
  });
}

function validationSummary(error: unknown) {
  if (error instanceof ZodError) {
    return JSON.stringify(error.flatten());
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown validation failure";
}

export async function GET(request: Request) {
  const dateKey = dateKeyFromNow();

  if (!isAuthorizedCronRequest(request)) {
    logWarn("cron.unauthorized", {
      dateKey,
      phase: "auth",
      errorCode: "cron_auth_failed"
    });

    return NextResponse.json(
      { status: "error", reason: "unauthorized" },
      { status: 401 }
    );
  }

  if (await hasSuccessfulSend(dateKey)) {
    logInfo("essay.skipped", {
      dateKey,
      phase: "preflight",
      reason: "already_sent"
    });

    return NextResponse.json({
      status: "skipped",
      reason: "already_sent"
    });
  }

  const lockAcquired = await acquireSendLock(dateKey);
  if (!lockAcquired) {
    logInfo("essay.skipped", {
      dateKey,
      phase: "preflight",
      reason: "already_running"
    });

    return NextResponse.json({
      status: "skipped",
      reason: "already_running"
    });
  }

  let topicId: string | null = null;
  let topicCluster: string | null = null;
  let openaiRequestId: string | null = null;
  let repairOpenaiRequestId: string | null = null;
  let resendEmailId: string | null = null;
  let wordCount = 0;

  try {
    const history = await getRecentSendHistory(21);
    const topic = selectTopic(history);
    topicId = topic.id;
    topicCluster = topic.cluster;

    logInfo("essay.topic_selected", {
      dateKey,
      phase: "selection",
      topicId,
      cluster: topic.cluster
    });

    let generation: GeneratedDraftResult | null = null;
    try {
      generation = await generateDraft(topic);
      openaiRequestId = generation.openaiRequestId;
    } catch (error) {
      if (error instanceof StructuredOutputValidationError) {
        openaiRequestId = error.openaiRequestId;
        let repaired;
        try {
          repaired = await repairDraft(error.rawOutput, error);
        } catch (repairError) {
          if (repairError instanceof StructuredOutputValidationError) {
            repairOpenaiRequestId = repairError.openaiRequestId;
          }

          throw repairError;
        }
        generation = {
          draft: repaired.draft,
          openaiRequestId: error.openaiRequestId,
          repairOpenaiRequestId: repaired.repairOpenaiRequestId,
          rawOutput: repaired.rawOutput
        };
        repairOpenaiRequestId = repaired.repairOpenaiRequestId;
      } else {
        throw error;
      }
    }

    if (!generation) {
      throw new Error("Essay generation produced no draft");
    }

    const normalized = normalizeEssayDraft(generation.draft);
    const draft = normalized.draft;
    wordCount = normalized.wordCount;
    const pdfBuffer = await renderEssayPdf(draft, {
      dateLabel: formatDateLabel(dateKey),
      wordCount
    });

    const emailResult = await sendEssayEmail({
      subject: `Daily Philosophy: ${draft.title}`,
      text: [
        `Today's essay is attached as a PDF.`,
        "",
        draft.subtitle,
        "",
        `Theme: ${draft.metadata.thinkerOrExperiment}`
      ].join("\n"),
      filename: `philosophy-${dateKey}.pdf`,
      pdfBuffer,
      idempotencyKey: `daily-philosophy-${dateKey}`
    });
    resendEmailId = emailResult.resendEmailId;

    const record: SendRecord = {
      dateKey,
      title: draft.title,
      topicId: draft.metadata.topicId,
      cluster: draft.metadata.cluster,
      model: process.env.OPENAI_MODEL ?? "gpt-5.4-mini",
      sentAt: new Date().toISOString(),
      status: "sent",
      openaiRequestId,
      repairOpenaiRequestId,
      resendEmailId,
      wordCount
    };

    await markSuccessfulSend(record);
    await appendSendHistory(record);

    logInfo("essay.sent", {
      dateKey,
      phase: "complete",
      topicId: draft.metadata.topicId,
      openaiRequestId,
      repairOpenaiRequestId,
      resendEmailId,
      wordCount
    });

    return NextResponse.json({
      status: "sent",
      dateKey,
      topicId: draft.metadata.topicId,
      resendEmailId
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const failureRecordBase = {
      title: "Daily Philosophy run failed",
      topicId: topicId ?? "unknown",
      cluster: topicCluster ?? "unknown",
      model: process.env.OPENAI_MODEL ?? "gpt-5.4-mini",
      openaiRequestId,
      repairOpenaiRequestId,
      resendEmailId,
      wordCount,
      errorCode: "run_failed",
      errorMessage
    };

    await writeFailureRecord(dateKey, failureRecordBase);

    logError("essay.failed", {
      dateKey,
      phase: "run",
      topicId,
      errorCode: "run_failed",
      message: errorMessage,
      validationError: validationSummary(error),
      openaiRequestId,
      repairOpenaiRequestId,
      resendEmailId
    });

    return NextResponse.json(
      { status: "error", reason: "run_failed" },
      { status: 500 }
    );
  } finally {
    await releaseSendLock(dateKey);
  }
}
