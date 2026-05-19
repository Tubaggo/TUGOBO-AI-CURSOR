# Tugobo AI Deployment Guide

This guide is for the first production rollout of `app.tugobo.com` and the existing marketing site on `tugobo.com`.

## 1. Required Environment Variables

Copy `.env.example` into the runtime environment for the `web` app and set real values for:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
DATABASE_URL=
OPENAI_API_KEY=
NEXT_PUBLIC_APP_URL=https://app.tugobo.com
```

Set these when the related production integration is enabled:

```env
AI_PROVIDER=openai
OPENAI_MODEL=gpt-4o-mini
DEEPSEEK_API_KEY=
DEEPSEEK_MODEL=deepseek-chat
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_NUMBER=
INNGEST_EVENT_KEY=
INNGEST_SIGNING_KEY=
RESEND_API_KEY=
NOTIFICATION_EMAIL=team@tugobo.ai
PILOT_HOTEL_ID=
NEXT_PUBLIC_PILOT_HOTEL_ID=
NEXT_PUBLIC_WHATSAPP_CONTACT=
```

Keep these server-only:

```env
DATABASE_URL
SUPABASE_SERVICE_ROLE_KEY
OPENAI_API_KEY
DEEPSEEK_API_KEY
TWILIO_AUTH_TOKEN
META_WHATSAPP_TOKEN
INNGEST_EVENT_KEY
INNGEST_SIGNING_KEY
LANGFUSE_SECRET_KEY
RESEND_API_KEY
```

Only variables prefixed with `NEXT_PUBLIC_` should be exposed to the browser.

## 2. Install And Verify

```bash
pnpm install --frozen-lockfile
pnpm.cmd --filter web type-check
pnpm.cmd lint
pnpm.cmd build
```

Production start:

```bash
pnpm.cmd --filter web start
```

Default Next.js port:

```bash
PORT=3000
```

## 3. Recommended Deploy Order

1. Provision Supabase production project and confirm auth, database, and realtime settings.
2. Apply database schema before traffic goes live.
3. Deploy `app.tugobo.com` with production env vars.
4. Verify login, `/app/overview`, live conversation APIs, and pilot hotel data access.
5. Point Twilio webhook to `https://app.tugobo.com/api/webhooks/twilio`.
6. Deploy or update `tugobo.com` after the app is healthy.

## 4. Domain Notes

- `tugobo.com`: marketing site / landing
- `app.tugobo.com`: operator panel and app APIs
- `lead.tugobo.com`: reserved for future lead engine, do not point yet unless a separate deployment is created

Set:

```env
NEXT_PUBLIC_APP_URL=https://app.tugobo.com
```

This value is used by the Twilio webhook signature flow.

## 5. Supabase Notes

- Use a production project, not the local dev instance.
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are safe for browser use.
- `DATABASE_URL` must be a server-side secret and should point to the production database connection string.
- Configure Supabase Auth redirect URL to include:

```text
https://app.tugobo.com/auth/callback
```

- If pilot live operations are enabled, set both:

```env
PILOT_HOTEL_ID=
NEXT_PUBLIC_PILOT_HOTEL_ID=
```

## 6. Smoke Test After Deploy

1. Open `https://app.tugobo.com/auth/login` and confirm magic-link sign-in works.
2. Confirm unauthenticated access to `/app/overview` redirects to login.
3. Confirm authenticated access returns to the intended app route after login.
4. Open the operator panel on mobile and refresh once to confirm session persistence.
5. Load the dashboard conversation views and confirm no missing-env crashes.
6. If Twilio is enabled, send a test WhatsApp message and verify the webhook responds successfully.
