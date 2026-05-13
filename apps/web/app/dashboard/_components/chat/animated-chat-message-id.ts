/** True for locally injected demo messages that should play the enter animation. */
export function isAnimatedChatMessageId(id: string): boolean {
  return (
    id.startsWith("incoming-") ||
    id.startsWith("staff-") ||
    id.startsWith("ai-resume-") ||
    id.startsWith("ai-confirm-") ||
    id.startsWith("sys-payment-")
  );
}
