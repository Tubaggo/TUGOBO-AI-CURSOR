import { notFound } from "next/navigation";
import { getConversationById, getConversations } from "@/lib/data/conversations";
import { ConversationsWorkspace } from "../_components/conversations-workspace";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ConversationDetailPage({ params }: PageProps) {
  const { id } = await params;
  const detail = getConversationById(id);
  if (!detail) {
    notFound();
  }
  const summaries = getConversations();
  return (
    <div className="flex h-[calc(100dvh-3.25rem)] max-h-[calc(100dvh-3.25rem)] flex-col overflow-hidden md:h-[calc(100dvh-3.5rem)] md:max-h-[calc(100dvh-3.5rem)]">
      <ConversationsWorkspace summaries={summaries} activeId={id} detail={detail} />
    </div>
  );
}
