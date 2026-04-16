# Daily Philosophy PDF

Single-user Next.js service that generates and emails a daily philosophy PDF.

## Stack

- Next.js + TypeScript + App Router
- OpenAI Responses API
- Upstash Redis
- Resend
- `@react-pdf/renderer`

## Environment

Copy `.env.example` to `.env.local` and fill in the values.

Important sender rule:

- `RESEND_FROM_EMAIL="Daily Philosophy <onboarding@resend.dev>"` is valid only if `DAILY_ESSAY_TO_EMAIL` exactly matches the Resend account email.
- Otherwise use a verified sending domain like `Daily Philosophy <essay@send.yourdomain.com>`.

Security notes:

- Keep `RESEND_API_KEY` server-side only.
- Prefer a sending-only Resend API key if your account supports it.
- Rotate `RESEND_API_KEY` if needed.

## Cron

`vercel.json` schedules the job daily at `05:00 UTC`.

## Current local limitation

This workspace does not currently have `node` or `npm` installed, so dependency installation, test execution, and build verification still need to happen after a Node toolchain is available.
