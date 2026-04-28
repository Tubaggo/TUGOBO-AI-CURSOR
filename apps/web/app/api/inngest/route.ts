import { serve } from "inngest/next";
import { inngest, notifyNewLead, processInboundMessage } from "@tugobo/core";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [processInboundMessage, notifyNewLead],
});
