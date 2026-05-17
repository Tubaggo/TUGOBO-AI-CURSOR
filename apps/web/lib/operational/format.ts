export function formatEur(value: number, compact = false): string {
  if (compact && value >= 1000) {
    return `€${(value / 1000).toFixed(1)}k`;
  }
  return `€${value.toLocaleString("en-EU", { maximumFractionDigits: 0 })}`;
}

export function formatPct(value: number): string {
  return `${Math.round(value)}%`;
}

export function formatDelta(value: number, suffix = ""): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value}${suffix}`;
}
