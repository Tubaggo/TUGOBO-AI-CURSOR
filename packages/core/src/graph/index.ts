import { Inngest } from "inngest";

export const inngest = new Inngest({ id: "tugobo-ai" });

/**
 * Inngest workflow: process an inbound WhatsApp message through the agent pipeline.
 * Day 4: wire intake agent
 * Day 5: wire pricing agent
 */
export const processInboundMessage = inngest.createFunction(
  { id: "process-inbound-message", name: "Process Inbound WhatsApp Message" },
  { event: "whatsapp/message.received" },
  async ({ event, step }) => {
    const { conversationId, messageId, hotelId } = event.data as {
      conversationId: string;
      messageId: string;
      hotelId: string;
    };

    // Step 1: echo reply (Day 1 MVP - replaced with agents from Day 4)
    const reply = await step.run("generate-reply", async () => {
      return {
        conversationId,
        messageId,
        hotelId,
        status: "reply_queued",
      };
    });

    return reply;
  }
);
