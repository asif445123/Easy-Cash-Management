"use client";

import DemoPageShell from "@/components/demo/DemoPageShell";
import {
  MONTH_LABELS,
  demoMonthWiseYear,
  demoIncomeAccountsMonthly,
  demoExpenseAccountsMonthly,
  type MonthlyAccountRow,
} from "@/lib/demoMonthWiseReport";

function cellText(value: number): string {
  return value === 0 ? "—" : value.toLocaleString("en-PK");
}

function monthlyTotals(accounts: MonthlyAccountRow[]): number[] {
  return MONTH_LABELS.map((_, i) => accounts.reduce((sum, a) => sum + a.values[i], 0));
}

// Month-over-month delta, matching the real report's logic exactly:
// "—" when both months are zero, "new" when it went from 0 to something,
// "-100%" when it dropped to zero, otherwise a signed rounded percentage.
function deltaLabel(prev: number, curr: number): string {
  if (prev === 0 && curr === 0) return "—";
  if (prev === 0 && curr > 0) return "new";
  if (curr === 0 && prev > 0) return "-100%";
  const pct = Math.round(((curr - prev) / prev) * 100);
  return `${pct >= 0 ? "+" : ""}${pct}%`;
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
                  <td key={i} className="px-3 py-2 text-right text-ink/70">
                    {cellText(v)}
                  </td>
                ))}
              </tr>
            ))}
            <tr className="bg-ink/5 font-semibold">
              <td className="px-3 py-2 sticky left-0 bg-ink/5">Total</td>
              {totals.map((v, i) => (
                <td key={i} className="px-3 py-2 text-right text-ink">
                  {v.toLocaleString("en-PK")}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function DemoMonthWiseReportPage() {
  const incomeTotals = monthlyTotals(demoIncomeAccountsMonthly);
  const expenseTotals = monthlyTotals(demoExpenseAccountsMonthly);

  return (
    <DemoPageShell title="Month Wise Report" description="Every Income/Expense account, broken down by calendar month.">
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

      <div className="bg-white rounded-2xl border border-ink/10 shadow-sm p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-ink/5 text-xs uppercase tracking-wide text-ink/50">
                <th className="px-3 py-2 text-left font-medium sticky left-0 bg-ink/5">Average per month</th>
                {MONTH_LABELS.map((m) => (
                  <th key={m} className="px-3 py-2 text-right font-medium">
                    {m}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-ink/5">
                <td className="px-3 py-2 text-ink/70 whitespace-nowrap sticky left-0 bg-white">Avg income</td>
                {incomeTotals.map((v, i) => (
                  <td key={i} className="px-3 py-2 text-right">
                    <div className="text-primary font-medium">{v.toLocaleString("en-PK")}</div>
                    <div className="text-[10px] text-ink/40">{deltaLabel(i === 0 ? 0 : incomeTotals[i - 1], v)}</div>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-3 py-2 text-ink/70 whitespace-nowrap sticky left-0 bg-white">Avg expense</td>
                {expenseTotals.map((v, i) => (
                  <td key={i} className="px-3 py-2 text-right">
                    <div className="text-red-600 font-medium">{v.toLocaleString("en-PK")}</div>
                    <div className="text-[10px] text-ink/40">{deltaLabel(i === 0 ? 0 : expenseTotals[i - 1], v)}</div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </DemoPageShell>
  );
}
