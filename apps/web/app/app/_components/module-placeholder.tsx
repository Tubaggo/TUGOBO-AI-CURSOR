type ModulePlaceholderProps = {
  title: string;
  description?: string;
};

export function ModulePlaceholder({ title, description }: ModulePlaceholderProps) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6 md:py-14">
      <div className="rounded-2xl border border-white/[0.06] bg-zinc-900/40 p-8 md:p-10">
        <h1 className="text-lg font-semibold text-white md:text-xl">{title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-white/45">
          {description ??
            "This module is scheduled for the next sprint. Navigation and shell are in place so we can ship domain logic incrementally."}
        </p>
        <div className="mt-8 h-px w-full bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
        <p className="mt-6 text-xs font-medium uppercase tracking-wider text-white/30">
          Coming in next sprint
        </p>
      </div>
    </div>
  );
}
