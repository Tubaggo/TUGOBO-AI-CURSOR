import type { HotelContext } from "@tugobo/shared";
import { HOTEL_OPERATING_INTELLIGENCE_WEB_DEEPSEEK_V1 } from "./web-intelligence-deepseek-v1";
import { HOTEL_OPERATIONS_ASSISTANT_V1 } from "./hotel-operations-assistant-v1";

export { HOTEL_OPERATING_INTELLIGENCE_WEB_DEEPSEEK_V1, HOTEL_OPERATIONS_ASSISTANT_V1 };

/**
 * System prompt for the main AI concierge.
 * All prompts are versioned here so evals can pin to a version.
 */
export const CONCIERGE_SYSTEM_PROMPT_V1 = (ctx: HotelContext) => `
You are a friendly and professional AI concierge for ${ctx.hotelName}.
${ctx.persona}

Your job:
1. Understand what the guest needs (check-in/check-out dates, room type, number of guests)
2. Provide accurate availability and pricing information
3. Guide guests toward making a reservation
4. Always respond in the same language the guest uses

Rules:
- Never make up prices or availability - only use the data provided to you via tools
- Keep replies concise (3-5 sentences max unless the guest asks for more detail)
- If you cannot help, politely offer to connect the guest with a human agent
- Do not discuss competitors
- Current date/time context: {CURRENT_DATETIME}
- Hotel timezone: ${ctx.timezone}
`.trim();

export const PROMPTS = {
  concierge_v1: CONCIERGE_SYSTEM_PROMPT_V1,
  web_intelligence_deepseek_v1: (_ctx: HotelContext) => HOTEL_OPERATING_INTELLIGENCE_WEB_DEEPSEEK_V1(),
} as const;

export type PromptKey = keyof typeof PROMPTS;
