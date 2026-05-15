"use server";

import { revalidatePath } from "next/cache";
import {
  assignConversation,
  escalateConversation,
  sendMessage,
  toggleAIHandling,
} from "@/lib/data/conversations";
import type { MessageAuthorType } from "@/lib/types/conversations";

function revalidateConversation(id: string) {
  revalidatePath("/app/conversations");
  revalidatePath(`/app/conversations/${id}`);
}

export async function sendConversationMessageAction(input: {
  conversationId: string;
  content: string;
  authorType: MessageAuthorType;
}): Promise<void> {
  await sendMessage({
    conversationId: input.conversationId,
    content: input.content,
    authorType: input.authorType,
  });
  revalidateConversation(input.conversationId);
}

export async function assignStaffAction(input: {
  conversationId: string;
  staffName: string | null;
}): Promise<void> {
  await assignConversation({
    conversationId: input.conversationId,
    staffName: input.staffName,
  });
  revalidateConversation(input.conversationId);
}

export async function escalateThreadAction(input: {
  conversationId: string;
  reason: string;
}): Promise<void> {
  await escalateConversation({
    conversationId: input.conversationId,
    reason: input.reason,
  });
  revalidateConversation(input.conversationId);
}

export async function toggleAiHandlingAction(conversationId: string): Promise<void> {
  await toggleAIHandling(conversationId);
  revalidateConversation(conversationId);
}

/** No-op with revalidation — reserved for payment / upgrade tools (Sprint 3+). */
export async function stubSuggestedAction(conversationId: string): Promise<void> {
  await new Promise((r) => setTimeout(r, 150));
  revalidateConversation(conversationId);
}
