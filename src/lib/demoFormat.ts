export function fmtRs(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return `Rs ${value.toLocaleString("en-PK", { maximumFractionDigits: 2 })}`;
}

export function fmtNum(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return value.toLocaleString("en-PK", { maximumFractionDigits: 2 });
}

export function fmtPct(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}
