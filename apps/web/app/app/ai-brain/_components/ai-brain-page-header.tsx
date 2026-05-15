type AIBrainPageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  asOf?: string;
};

export function AIBrainPageHeader({ eyebrow, title, description, asOf }: AIBrainPageHeaderProps) {
  return (
    <header className="mb-6 border-b border-white/[0.07] pb-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-300/85">
        {eyebrow}
      </p>
      <div className="mt-1 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-white md:text-xl">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/42">{description}</p>
        </div>
        {asOf ? (
          <p className="text-[11px] tabular-nums text-white/30">
            Refreshed{" "}
            {new Date(asOf).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
          </p>
        ) : null}
      </div>
    </header>
  );
}
