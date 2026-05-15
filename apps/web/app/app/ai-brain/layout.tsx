import { AIBrainSubnav } from "./_components/ai-brain-subnav";

export default function AIBrainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <AIBrainSubnav />
      {children}
    </div>
  );
}
