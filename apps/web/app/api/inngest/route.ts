import { serve } from "inngest/next";
import {
  inngest,
  notifyNewLead,
  prepareConversationAiSuggestion,
  processInboundMessage,
} from "@tugobo/core";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [processInboundMessage, prepareConversationAiSuggestion, notifyNewLead],
});
