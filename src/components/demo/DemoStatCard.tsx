export default function DemoStatCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "green" | "red";
}) {
  const valueClass =
    tone === "green" ? "text-primary" : tone === "red" ? "text-red-600" : "text-ink";
  return (
    <div className="bg-white rounded-2xl border border-ink/10 shadow-sm p-4">
      <div className="text-xs uppercase tracking-wide text-ink/50 mb-1">{label}</div>
      <div className={`text-lg font-bold ${valueClass}`}>{value}</div>
    </div>
  );
}
