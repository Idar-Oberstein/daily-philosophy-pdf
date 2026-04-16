import "server-only";

import { getConfig } from "@/lib/config";

export type EmailSendResult = {
  resendEmailId: string | null;
};

export async function sendEssayEmail(params: {
  subject: string;
  text: string;
  filename: string;
  pdfBuffer: Buffer;
  idempotencyKey: string;
}) {
  const config = getConfig();
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.RESEND_API_KEY}`,
      "Content-Type": "application/json",
      "Idempotency-Key": params.idempotencyKey
    },
    body: JSON.stringify({
      from: config.RESEND_FROM_EMAIL,
      to: [config.DAILY_ESSAY_TO_EMAIL],
      subject: params.subject,
      text: params.text,
      attachments: [
        {
          filename: params.filename,
          content: params.pdfBuffer.toString("base64")
        }
      ]
    })
  });

  const payload = (await response.json().catch(() => null)) as
    | { id?: string; message?: string; error?: string }
    | null;

  if (!response.ok) {
    throw Object.assign(new Error(payload?.message ?? payload?.error ?? "Resend send failed"), {
      resendEmailId: payload?.id ?? null
    });
  }

  return {
    resendEmailId: payload?.id ?? null
  } satisfies EmailSendResult;
}
