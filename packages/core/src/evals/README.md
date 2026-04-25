# Evals

Golden test cases for prompt regression testing.
10 cases required before Day 13 polish phase.

Each case defines:
- `input`: a guest message (or conversation history)
- `expectedExtraction`: check-in, check-out, guests, room type, language
- `expectedReplyContains`: strings that must appear in the AI reply

Run: `pnpm --filter @tugobo/core evals`
