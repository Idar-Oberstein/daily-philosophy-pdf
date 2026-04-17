import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { buildEssayPathname, buildEssaySlug } from "@/lib/archive/slug";
import { isArchivePublishingEnabled, uploadEssayPdf } from "@/lib/archive/blob";
import { upsertPublishedEssay } from "@/lib/archive/store";
import type { PublishedEssayRecord } from "@/lib/archive/types";
import { getConfigResult } from "@/lib/config";
import { normalizeEssayDraft } from "@/lib/content/normalize-length";
import { isAuthorizedCronRequest } from "@/lib/cron-auth";
import { sendEssayEmail } from "@/lib/email/send-email";
import { logError, logInfo, logWarn } from "@/lib/logging";
import { generateDraft } from "@/lib/openai/generate-draft";
import { repairDraft } from "@/lib/openai/repair-draft";
import { refineDraft } from "@/lib/openai/refine-draft";
import { type GeneratedDraftResult } from "@/lib/openai/schema";
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

function isTestRun(request: Request) {
  const url = new URL(request.url);
  return url.searchParams.get("test") === "1";
}

function buildSendModeLabel(isTest: boolean) {
  return isTest ? "test" : "scheduled";
}

function buildIdempotencyKey(dateKey: string, isTest: boolean) {
  if (!isTest) {
    return `daily-philosophy-${dateKey}`;
  }

  return `daily-philosophy-test-${dateKey}-${Date.now()}-${crypto.randomUUID()}`;
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

function missingConfigFields(error: ZodError) {
  return error.issues.map((issue) => issue.path.join(".")).filter(Boolean);
}

async function recordValidationFailure(params: {
  dateKey: string;
  testRun: boolean;
  mode: string;
  topicId: string | null;
  topicCluster: string | null;
  openaiRequestId: string | null;
  repairOpenaiRequestId: string | null;
  message: string;
}) {
  if (!params.testRun) {
    await writeFailureRecord(params.dateKey, {
      title: "Daily Philosophy validation failed",
      topicId: params.topicId ?? "unknown",
      cluster: params.topicCluster ?? "unknown",
      model: process.env.OPENAI_MODEL ?? "gpt-5.4-mini",
      openaiRequestId: params.openaiRequestId,
      repairOpenaiRequestId: params.repairOpenaiRequestId,
      resendEmailId: null,
      wordCount: 0,
      errorCode: "validation_failed",
      errorMessage: params.message
    });
  }

  logWarn("essay.validation_failed", {
    dateKey: params.dateKey,
    mode: params.mode,
    phase: "generation",
    topicId: params.topicId,
    errorCode: "validation_failed",
    message: params.message,
    openaiRequestId: params.openaiRequestId,
    repairOpenaiRequestId: params.repairOpenaiRequestId,
    resendEmailId: null
  });
}

export async function GET(request: Request) {
  const dateKey = dateKeyFromNow();
  const testRun = isTestRun(request);
  const mode = buildSendModeLabel(testRun);
  const configResult = getConfigResult();

  if (!configResult.ok) {
    const missingFields = missingConfigFields(configResult.error);

    logError("essay.misconfigured", {
      dateKey,
      mode,
      phase: "config",
      errorCode: "config_invalid",
      message: "Required environment variables are missing or invalid.",
      missingFields
    });

    return NextResponse.json(
      {
        status: "error",
        reason: "misconfigured",
        missingFields
      },
      { status: 503 }
    );
  }

  if (!isAuthorizedCronRequest(request, configResult.config.CRON_SECRET)) {
    logWarn("cron.unauthorized", {
      dateKey,
      phase: "auth",
      mode,
      errorCode: "cron_auth_failed"
    });

    return NextResponse.json(
      { status: "error", reason: "unauthorized" },
      { status: 401 }
    );
  }

  if (!testRun && (await hasSuccessfulSend(dateKey))) {
    logInfo("essay.skipped", {
      dateKey,
      mode,
      phase: "preflight",
      reason: "already_sent"
    });

    return NextResponse.json({
      status: "skipped",
      reason: "already_sent"
    });
  }

  const lockKeyDate = testRun ? `${dateKey}:test` : dateKey;
  const lockAcquired = await acquireSendLock(lockKeyDate);
  if (!lockAcquired) {
    logInfo("essay.skipped", {
      dateKey,
      mode,
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
  let archiveSlug: string | null = null;

  try {
    const history = await getRecentSendHistory(21);
    const topic = selectTopic(history);
    topicId = topic.id;
    topicCluster = topic.cluster;

    logInfo("essay.topic_selected", {
      dateKey,
      mode,
      phase: "selection",
      topicId,
      cluster: topic.cluster
    });

    let generation: GeneratedDraftResult | null = null;
    const firstAttempt = await generateDraft(topic);

    if (firstAttempt.ok) {
      generation = firstAttempt;
      openaiRequestId = firstAttempt.openaiRequestId;
    } else {
      openaiRequestId = firstAttempt.openaiRequestId;
      const repaired = await repairDraft(firstAttempt.rawOutput, firstAttempt.message);

      if (!repaired.ok) {
        repairOpenaiRequestId = repaired.repairOpenaiRequestId;
        await recordValidationFailure({
          dateKey,
          testRun,
          mode,
          topicId,
          topicCluster,
          openaiRequestId,
          repairOpenaiRequestId,
          message: repaired.message
        });

        return NextResponse.json(
          { status: "error", reason: "validation_failed", dateKey },
          { status: 500 }
        );
      }

      generation = {
        ok: true,
        draft: repaired.draft,
        openaiRequestId,
        repairOpenaiRequestId: repaired.repairOpenaiRequestId,
        rawOutput: repaired.rawOutput
      };
      repairOpenaiRequestId = repaired.repairOpenaiRequestId;
    }

    if (!generation) {
      throw new Error("Essay generation produced no draft");
    }

    const refined = await refineDraft({
      draft: generation.draft,
      topic
    });

    const workingDraft = refined.ok ? refined.draft : generation.draft;
    if (!refined.ok) {
      logWarn("essay.refinement_skipped", {
        dateKey,
        mode,
        phase: "refinement",
        topicId,
        openaiRequestId: refined.openaiRequestId,
        message: refined.message
      });
    }

    const normalized = normalizeEssayDraft(workingDraft);
    const draft = normalized.draft;
    wordCount = normalized.wordCount;
    const pdfBuffer = await renderEssayPdf(draft, {
      dateLabel: formatDateLabel(dateKey),
      wordCount
    });
    const sentAt = new Date().toISOString();
    let archiveRecord: PublishedEssayRecord | null = null;

    if (!testRun) {
      archiveSlug = buildEssaySlug(dateKey, draft.metadata.topicId);

      if (isArchivePublishingEnabled()) {
        const pdfPublication = await uploadEssayPdf({
          pathname: buildEssayPathname(dateKey, archiveSlug),
          pdfBuffer
        });

        archiveRecord = {
          slug: archiveSlug,
          dateKey,
          title: draft.title,
          subtitle: draft.subtitle,
          hook: draft.hook,
          sections: draft.sections,
          takeaways: draft.takeaways,
          reflectionExercise: draft.reflectionExercise,
          metadata: draft.metadata,
          pdfUrl: pdfPublication.url,
          pdfPathname: pdfPublication.pathname,
          wordCount,
          sentAt
        };

        logInfo("essay.archived", {
          dateKey,
          mode,
          phase: "archive",
          topicId: draft.metadata.topicId,
          slug: archiveSlug,
          pdfUrl: pdfPublication.url
        });
      } else {
        logWarn("essay.archive_disabled", {
          dateKey,
          mode,
          phase: "archive",
          topicId: draft.metadata.topicId,
          message: "Blob storage is not configured; skipping public publication."
        });
      }
    }

    const emailResult = await sendEssayEmail({
      subject: testRun
        ? `Daily Philosophy Test: ${draft.title}`
        : `Daily Philosophy: ${draft.title}`,
      text: [
        testRun
          ? `This is a manual test run of your daily philosophy essay.`
          : `Today's essay is attached as a PDF.`,
        "",
        draft.subtitle,
        "",
        `Theme: ${draft.metadata.thinkerOrExperiment}`
      ].join("\n"),
      filename: testRun
        ? `philosophy-test-${dateKey}.pdf`
        : `philosophy-${dateKey}.pdf`,
      pdfBuffer,
      idempotencyKey: buildIdempotencyKey(dateKey, testRun)
    });
    resendEmailId = emailResult.resendEmailId;

    const record: SendRecord = {
      dateKey,
      title: draft.title,
      topicId: draft.metadata.topicId,
      cluster: draft.metadata.cluster,
      model: process.env.OPENAI_MODEL ?? "gpt-5.4-mini",
      sentAt,
      status: "sent",
      openaiRequestId,
      repairOpenaiRequestId,
      resendEmailId,
      wordCount
    };

    if (!testRun) {
      await markSuccessfulSend(record);
      await appendSendHistory(record);

      if (archiveRecord) {
        await upsertPublishedEssay(archiveRecord);
      }
    }

    logInfo("essay.sent", {
      dateKey,
      mode,
      phase: "complete",
      topicId: draft.metadata.topicId,
      slug: archiveSlug,
      openaiRequestId,
      repairOpenaiRequestId,
      resendEmailId,
      wordCount
    });

    return NextResponse.json({
      status: "sent",
      mode,
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

    if (!testRun) {
      await writeFailureRecord(dateKey, failureRecordBase);
    }

    logError("essay.failed", {
      dateKey,
      mode,
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
    await releaseSendLock(lockKeyDate);
  }
}
