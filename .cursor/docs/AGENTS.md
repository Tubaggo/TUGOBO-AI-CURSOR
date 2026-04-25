# Agent Contract

Every agent in `packages/core/src/agents/` follows this contract.

## Agent Function Signature

```typescript
export async function myAgent(
  ctx: HotelContext,
  input: MyAgentInput,
  tools: Record<string, CoreTool>  // from Vercel AI SDK
): Promise<MyAgentOutput>
```

## Tool Contract

Every tool in `packages/core/src/tools/` must:
1. Be a pure function (no hidden state)
2. Accept typed Zod-validated parameters
3. Return a typed result
4. Never call external APIs directly — always go through the channel adapter or DB client passed in

## Agents (roadmap)

| Agent | Day | Status | Responsibility |
|-------|-----|--------|----------------|
| Intake | 4 | planned | Extract checkin/checkout/guests/room/language from message |
| Pricing | 5 | planned | Check availability, calculate price, generate quote |
| Reply | 1 (stub) | active | Format and send message via channel adapter |
| Handoff | 9 | planned | Detect low confidence, out-of-hours, escalate to human |
| Upsell | future | not built | Suggest upgrades after booking confirmed |
| ReviewReply | future | not built | Auto-respond to Google/TripAdvisor reviews |

## Inngest Workflow

All agents run inside `processInboundMessage` function in `packages/core/src/graph/index.ts`.

Each agent is a `step.run("agent-name", ...)` call. Steps are:
- Retried automatically on failure
- Observable in Inngest dashboard
- Replayable for debugging

## Adding a New Agent

1. Create `packages/core/src/agents/my-agent.ts`
2. Create its tools in `packages/core/src/tools/my-tool.ts`
3. Add a `step.run("my-agent", ...)` call in the Inngest workflow
4. Add golden test cases to `packages/core/src/evals/`
5. Update this file
