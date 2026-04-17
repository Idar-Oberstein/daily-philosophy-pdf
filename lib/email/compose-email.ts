import type { DailyEssayDraft } from "@/lib/openai/schema";

type EssayEmailCopy = {
  subject: string;
  text: string;
  html: string;
};

function formatDateLabel(dateKey: string) {
  return new Date(`${dateKey}T00:00:00.000Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC"
  });
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function paragraphize(value: string) {
  return value
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p style="margin:0 0 14px;color:#342255;font-size:16px;line-height:1.7;">${escapeHtml(paragraph)}</p>`)
    .join("");
}

export function composeEssayEmail(params: {
  draft: DailyEssayDraft;
  dateKey: string;
  testRun: boolean;
  archiveUrl?: string | null;
}): EssayEmailCopy {
  const { draft, dateKey, testRun, archiveUrl } = params;
  const dateLabel = formatDateLabel(dateKey);
  const subject = testRun
    ? `Philo-Snacks Test | ${draft.title}`
    : `Philo-Snacks | ${draft.title}`;

  const intro = testRun
    ? "This is a manual test run of the current Philo-Snacks delivery."
    : "Your morning essay is attached as a PDF.";

  const context = testRun
    ? "It reflects the current live pipeline, but this test run is not published to the public archive."
    : "The attached PDF contains today's full essay in its finished reading format.";

  const footer = archiveUrl
    ? `Public archive: ${archiveUrl}`
    : "Philo-Snacks publishes short, serious philosophy essays for intelligent general readers.";

  const text = [
    "Philo-Snacks",
    "by Raphael Cullmann",
    "",
    intro,
    context,
    "",
    `${dateLabel}`,
    "",
    draft.title,
    draft.subtitle,
    "",
    "Today's problem",
    draft.hook,
    "",
    `Thinker / frame: ${draft.metadata.thinkerOrExperiment}`,
    `Topic cluster: ${draft.metadata.cluster}`,
    "",
    footer
  ].join("\n");

  const archiveMarkup = archiveUrl
    ? `<div style="margin-top:24px;">
        <a href="${escapeHtml(archiveUrl)}" style="display:inline-block;border-radius:999px;background:linear-gradient(135deg,#6f39f6,#9b6bff);padding:12px 18px;color:#ffffff;font-size:14px;font-weight:700;letter-spacing:0.01em;text-decoration:none;">Visit the archive</a>
      </div>`
    : "";

  const html = `<!doctype html>
<html>
  <body style="margin:0;background:#f5f0ff;padding:32px 18px;font-family:Georgia,'Times New Roman',serif;">
    <div style="margin:0 auto;max-width:680px;">
      <div style="margin-bottom:18px;color:#6f39f6;font-size:13px;font-weight:700;letter-spacing:0.22em;text-transform:uppercase;">Philo-Snacks</div>
      <div style="border:1px solid rgba(111,57,246,0.14);border-radius:28px;background:#ffffff;padding:34px 30px;box-shadow:0 24px 70px rgba(63,24,120,0.10);">
        <div style="margin-bottom:18px;color:#7f63b8;font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">by Raphael Cullmann</div>
        <div style="margin-bottom:12px;color:#5d42a8;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;">${escapeHtml(dateLabel)}</div>
        <h1 style="margin:0 0 10px;color:#24143f;font-size:38px;line-height:1.08;">${escapeHtml(draft.title)}</h1>
        <p style="margin:0 0 22px;color:#5a4784;font-size:20px;line-height:1.5;">${escapeHtml(draft.subtitle)}</p>
        <div style="margin-bottom:20px;border-radius:20px;background:linear-gradient(145deg,#f7f2ff,#efe6ff);padding:18px 20px;">
          <p style="margin:0 0 10px;color:#24143f;font-size:17px;line-height:1.65;"><strong>${escapeHtml(intro)}</strong></p>
          <p style="margin:0;color:#4a356d;font-size:15px;line-height:1.65;">${escapeHtml(context)}</p>
        </div>
        <div style="margin-bottom:20px;">
          <div style="margin-bottom:8px;color:#6f39f6;font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;">Today's problem</div>
          ${paragraphize(draft.hook)}
        </div>
        <div style="display:grid;gap:10px;margin-bottom:10px;border-top:1px solid rgba(111,57,246,0.12);padding-top:18px;">
          <div style="color:#342255;font-size:15px;line-height:1.5;"><strong>Thinker / frame:</strong> ${escapeHtml(draft.metadata.thinkerOrExperiment)}</div>
          <div style="color:#342255;font-size:15px;line-height:1.5;"><strong>Topic cluster:</strong> ${escapeHtml(draft.metadata.cluster)}</div>
        </div>
        ${archiveMarkup}
      </div>
    </div>
  </body>
</html>`;

  return {
    subject,
    text,
    html
  };
}
