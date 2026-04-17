# Daily Philosophy PDF

Single-user Next.js service that generates a daily philosophy essay, emails the
PDF version, and publishes finished essays to a public archive website.

## Stack

- Next.js + TypeScript + App Router
- OpenAI Responses API
- Upstash Redis
- Resend
- Vercel Blob
- `@react-pdf/renderer`

## Environment

Copy `.env.example` to `.env.local` and fill in the values.

Public archive note:

- `BLOB_READ_WRITE_TOKEN` enables automatic publication of PDFs to Vercel Blob.
- Without that token, the daily essay still sends by email, but the public
  archive will remain empty.

Important sender rule:

- `RESEND_FROM_EMAIL="Daily Philosophy <onboarding@resend.dev>"` is valid only if `DAILY_ESSAY_TO_EMAIL` exactly matches the Resend account email.
- Otherwise use a verified sending domain like `Daily Philosophy <essay@send.yourdomain.com>`.

Security notes:

- Keep `RESEND_API_KEY` server-side only.
- Prefer a sending-only Resend API key if your account supports it.
- Rotate `RESEND_API_KEY` if needed.

## Cron

`vercel.json` schedules the job daily at `05:00 UTC`.

## Public archive

Published essays appear on:

- `/`
- `/archive`
- `/essay/[slug]`

Each scheduled run uploads the PDF to Vercel Blob, stores the essay record in
Upstash Redis, and exposes both the HTML reading view and PDF download link.
