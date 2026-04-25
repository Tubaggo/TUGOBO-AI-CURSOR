# Tugobo AI - Architecture

## Overview

AI reservation and lead conversion system for hotels. A hotel connects their WhatsApp number; Tugobo AI answers inquiries, qualifies leads, sends quotes, and closes reservations automatically.

## Monorepo Structure

```
tugobo-ai/
├── apps/web/          # Next.js 15 (App Router) - dashboard + API + webhooks
├── packages/
│   ├── shared/        # Types, logger, env validation (Zod)
│   ├── db/            # Drizzle ORM schema + client (Postgres via Supabase)
│   ├── channels/      # Channel adapters (Twilio week1, Meta week2)
│   └── core/          # Agent logic, tools, Inngest workflows, prompts
└── supabase/          # Drizzle-generated migrations
```

## Data Flow

```
Guest WhatsApp message
  → Twilio/Meta webhook (apps/web/app/api/webhooks/)
  → Signature validation
  → Insert message to DB
  → Inngest event: whatsapp/message.received
  → Inngest workflow (packages/core/src/graph/)
      → Intake Agent (extracts: checkin, checkout, guests, room, language)
      → Pricing Agent (checks availability, generates quote)
      → Reply Agent (formats, sends via channel adapter)
  → Staff dashboard (Supabase Realtime)
```

## Multi-Tenancy

Every business table has `hotel_id`. Supabase RLS enforces row isolation. A user can belong to one hotel (MVP) via `hotel_members` table.

## Channel Adapter Pattern

All channel interactions go through `ChannelAdapter` interface in `packages/channels/src/types.ts`. Swapping Twilio → Meta = change one constructor call. Agent code never touches provider SDKs.

## Agent Evolution (Paperclip prep)

Agents are plain async functions that receive `HotelContext` and AI SDK tool set. They run inside Inngest `step.run()` calls. Adding a new agent = new file + new step. No graph rewrite needed.

## Key Dependencies

- Next.js 15 + Vercel AI SDK (ai package)
- Supabase (Postgres + pgvector + Auth + Realtime)
- Drizzle ORM
- Inngest (durable workflows)
- Twilio SDK / Meta WhatsApp Cloud API
- OpenAI GPT-4o family
- Langfuse (LLM observability, Day 11)
