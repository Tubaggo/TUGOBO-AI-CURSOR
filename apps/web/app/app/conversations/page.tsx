import { getConversations } from "@/lib/data/conversations";
import { ConversationsWorkspace } from "./_components/conversations-workspace";

export default function ConversationsIndexPage() {
  const summaries = getConversations();
  return (
    <div className="flex h-[calc(100dvh-3.25rem)] max-h-[calc(100dvh-3.25rem)] flex-col overflow-hidden md:h-[calc(100dvh-3.5rem)] md:max-h-[calc(100dvh-3.5rem)]">
      <ConversationsWorkspace summaries={summaries} activeId={null} detail={null} />
    </div>
  );
}
