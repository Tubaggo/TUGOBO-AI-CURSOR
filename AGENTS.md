# Tugobo AI - Agent Guidelines

This is a pnpm monorepo for an AI WhatsApp reservation system for hotels.

## Key Rules (always follow)
1. Never write raw SQL — use Drizzle ORM via `@tugobo/db`
2. Never call Twilio/Meta directly from app code — use `@tugobo/channels` adapters
3. All agent side-effects go through typed tools in `packages/core/src/tools/`
4. All durable workflows go through Inngest in `packages/core/src/graph/`
5. Never log phone numbers or message bodies
6. Every table has `hotel_id` (multi-tenant)
7. Validate Twilio webhook signature before processing

## Package layout
- `@tugobo/shared` — types, logger, env
- `@tugobo/db` — Drizzle schema + client
- `@tugobo/channels` — channel adapters
- `@tugobo/core` — agents, tools, Inngest workflows, prompts

See `.cursor/docs/ARCHITECTURE.md` and `.cursor/docs/AGENTS.md` for full details.
