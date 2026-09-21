"use client";

import DemoPageShell from "@/components/demo/DemoPageShell";
import {
  MONTH_LABELS,
  demoMonthWiseYear,
  demoIncomeAccountsMonthly,
  demoExpenseAccountsMonthly,
  type MonthlyAccountRow,
} from "@/lib/demoMonthWiseReport";

function monthlyTotals(accounts: MonthlyAccountRow[]): number[] {
  return MONTH_LABELS.map((_, i) => accounts.reduce((sum, a) => sum + a.values[i], 0));
}

// Same "each month vs the one right before it" logic as the real report:
// - both zero → no delta shown at all
// - 0 → something → the absolute increase ("+2,929"), since a % from zero
//   is meaningless
// - something → 0 → "-100%"
// - otherwise → a signed rounded percentage
function deltaCell(prev: number, curr: number): { text: string; positive: boolean } | null {
  if (prev === 0 && curr === 0) return null;
  if (prev === 0 && curr > 0) return { text: `+${curr.toLocaleString("en-PK")}`, positive: true };
  if (curr === 0 && prev > 0) return { text: "-100%", positive: false };
  const pct = Math.round(((curr - prev) / prev) * 100);
  return { text: `${pct >= 0 ? "+" : ""}${pct}%`, positive: pct >= 0 };
}

function ValueCell({ value, prev }: { value: number; prev: number }) {
  const delta = deltaCell(prev, value);
  return (
    <td className="px-3 py-2 text-right">
      <div className={value === 0 ? "text-ink/30" : "text-ink/70"}>{value === 0 ? "—" : value.toLocaleString("en-PK")}</div>
      {delta && (
        <div className={`text-[10px] ${delta.positive ? "text-primary" : "text-red-600"}`}>{delta.text}</div>
      )}
    </td>
  );
}

function AccountTable({ title, accounts }: { title: string; accounts: MonthlyAccountRow[] }) {
  const totals = monthlyTotals(accounts);
  return (
    <div className="bg-white rounded-2xl border border-ink/10 shadow-sm p-5 mb-5">
      <h2 className="font-semibold text-ink mb-3">{title}</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-ink/5 text-xs uppercase tracking-wide text-ink/50">
              <th className="px-3 py-2 text-left font-medium sticky left-0 bg-ink/5">Account</th>
              {MONTH_LABELS.map((m) => (
                <th key={m} className="px-3 py-2 text-right font-medium">
                  {m}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {accounts.map((row) => (
              <tr key={row.name} className="border-b border-ink/5 last:border-0">
                <td className="px-3 py-2 text-primary whitespace-nowrap sticky left-0 bg-white">{row.name}</td>
                {row.values.map((v, i) => (
                  <ValueCell key={i} value={v} prev={i === 0 ? 0 : row.values[i - 1]} />
                ))}
              </tr>
            ))}
            <tr className="bg-ink/5 font-semibold">
              <td className="px-3 py-2 sticky left-0 bg-ink/5">Total</td>
              {totals.map((v, i) => (
                <ValueCell key={i} value={v} prev={i === 0 ? 0 : totals[i - 1]} />
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function DemoMonthComparisonPage() {
  return (
    <DemoPageShell
      title="Month Wise Comparison"
      description="Each month compared to the one right before it — e.g. House Rent Rs 14,000 in August vs Rs 7,000 in July shows as +100%."
    >
      <div className="bg-white rounded-2xl border border-ink/10 shadow-sm p-5 mb-5 max-w-xs">
        <label className="block text-sm font-medium text-ink/70 mb-1">Year</label>
        <input
          type="text"
          value={demoMonthWiseYear}
          disabled
          readOnly
          title="Filters are illustrative in this demo"
          className="w-full px-3 py-2 rounded-lg border border-ink/15 bg-ink/[0.03] text-ink/70 cursor-not-allowed"
        />
      </div>

      <AccountTable title="Income" accounts={demoIncomeAccountsMonthly} />
      <AccountTable title="Expenses" accounts={demoExpenseAccountsMonthly} />
    </DemoPageShell>
  );
}
