import { getConversationById, getConversations } from "../conversations";

export const conversationRepository = {
  findAllSummaries: getConversations,
  findById: getConversationById,
};
