"use client";

import DemoPageShell from "@/components/demo/DemoPageShell";
import { YEARS, demoIncomeAccountsYearly, demoExpenseAccountsYearly, type YearlyAccountRow } from "@/lib/demoYearWiseReport";

function yearlyTotals(accounts: YearlyAccountRow[]): Record<number, number> {
  const totals: Record<number, number> = {};
  YEARS.forEach((y) => {
    totals[y] = accounts.reduce((sum, a) => sum + a.values[y], 0);
  });
  return totals;
}

function BarCell({ value, rowMax, tone }: { value: number; rowMax: number; tone: "green" | "rose" }) {
  const pct = rowMax > 0 ? Math.max((value / rowMax) * 100, value > 0 ? 8 : 0) : 0;
  const barColor = tone === "green" ? "bg-primary/30" : "bg-red-300";
  return (
    <td className="px-3 py-2 text-right align-middle">
      <div className="flex flex-col items-end gap-1">
        <div className="w-16 h-1.5 rounded-full bg-ink/5 overflow-hidden">
          {value > 0 && <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%`, marginLeft: "auto" }} />}
        </div>
        <span className={value === 0 ? "text-ink/30" : "text-ink/70"}>{value === 0 ? "—" : value.toLocaleString("en-PK")}</span>
      </div>
    </td>
  );
}

function AccountTable({ title, accounts, tone }: { title: string; accounts: YearlyAccountRow[]; tone: "green" | "rose" }) {
  const totals = yearlyTotals(accounts);
  return (
    <div className="bg-white rounded-2xl border border-ink/10 shadow-sm p-5 mb-5">
      <h2 className="font-semibold text-ink mb-3">{title}</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-ink/5 text-xs uppercase tracking-wide text-ink/50">
              <th className="px-3 py-2 text-left font-medium sticky left-0 bg-ink/5">Account</th>
              {YEARS.map((y) => (
                <th key={y} className="px-3 py-2 text-right font-medium">
                  {y}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {accounts.map((row) => {
              const rowMax = Math.max(...YEARS.map((y) => row.values[y]));
              return (
                <tr key={row.name} className="border-b border-ink/5 last:border-0">
                  <td className="px-3 py-2 text-primary whitespace-nowrap sticky left-0 bg-white">{row.name}</td>
                  {YEARS.map((y) => (
                    <BarCell key={y} value={row.values[y]} rowMax={rowMax} tone={tone} />
                  ))}
                </tr>
              );
            })}
            <tr className="bg-ink/5 font-semibold">
              <td className="px-3 py-2 sticky left-0 bg-ink/5">Total</td>
              {YEARS.map((y) => (
                <td key={y} className={`px-3 py-2 text-right ${tone === "green" ? "text-primary" : "text-red-600"}`}>
                  {totals[y].toLocaleString("en-PK")}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function DemoYearWisePage() {
  return (
    <DemoPageShell title="Year Wise Report" description="Every Income/Expense account, broken down by year.">
      <div className="bg-white rounded-2xl border border-ink/10 shadow-sm p-5 mb-5 max-w-md">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-ink/70 mb-1">From year</label>
            <input
              type="text"
              value={YEARS[0]}
              disabled
              readOnly
              title="Filters are illustrative in this demo"
              className="w-full px-3 py-2 rounded-lg border border-ink/15 bg-ink/[0.03] text-ink/70 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink/70 mb-1">To year</label>
            <input
              type="text"
              value={YEARS[YEARS.length - 1]}
              disabled
              readOnly
              title="Filters are illustrative in this demo"
              className="w-full px-3 py-2 rounded-lg border border-ink/15 bg-ink/[0.03] text-ink/70 cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      <AccountTable title="Income" accounts={demoIncomeAccountsYearly} tone="green" />
      <AccountTable title="Expenses" accounts={demoExpenseAccountsYearly} tone="rose" />
    </DemoPageShell>
  );
}
