import { z } from "zod";

/**
 * Structured operational signals from the intelligence layer (Hotel Operating Intelligence).
 * All fields optional so the model can partial-fill; UI treats absence as "not scored".
 */
export const hotelIntelligenceInsightsSchema = z.object({
  leadIntent: z.enum(["booking", "information", "pricing", "complaint", "other"]).optional(),
  urgencyScore: z.number().min(0).max(100).optional(),
  takeoverRecommended: z.boolean().optional(),
  reservationLikelihood: z.number().min(0).max(100).optional(),
  nextBestAction: z.string().max(600).optional(),
});

export type HotelIntelligenceInsights = z.infer<typeof hotelIntelligenceInsightsSchema>;

/** Wire payload for POST /api/intelligence/chat */
export const intelligenceChatRequestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant", "system"]),
        content: z.string().min(1).max(12_000),
      })
    )
    .min(1)
    .max(32),
});

export type IntelligenceChatRequest = z.infer<typeof intelligenceChatRequestSchema>;

/** Wire JSON from POST /api/intelligence/chat (success or disabled). */
export const intelligenceChatWireSchema = z
  .object({
    enabled: z.boolean(),
    reply: z.string().min(1).optional(),
    insights: hotelIntelligenceInsightsSchema.nullable().optional(),
    model: z.string().optional(),
    error: z.string().optional(),
  })
  .refine((d) => !d.enabled || Boolean(d.reply?.trim()), {
    message: "reply is required when enabled is true",
    path: ["reply"],
  });

export type IntelligenceChatWire = z.infer<typeof intelligenceChatWireSchema>;
