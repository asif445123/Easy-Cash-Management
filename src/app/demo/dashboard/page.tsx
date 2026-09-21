"use client";

import DemoPageShell from "@/components/demo/DemoPageShell";
import DemoFilterBar from "@/components/demo/DemoFilterBar";
import DemoStatCard from "@/components/demo/DemoStatCard";
import DemoTable from "@/components/demo/DemoTable";
import ExpensePieChart from "@/components/demo/ExpensePieChart";
import { demoDashboard } from "@/lib/demoData";
import { fmtRs } from "@/lib/demoFormat";

export default function DemoDashboardPage() {
  const d = demoDashboard;

  return (
    <DemoPageShell title="Dashboard">
      <DemoFilterBar fields={[{ label: "From", value: d.from }, { label: "To", value: d.to }]} showPrint={false} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        <DemoStatCard label="Balance" value={fmtRs(d.balance)} />
        <DemoStatCard label="Income" value={fmtRs(d.income)} tone="green" />
        <DemoStatCard label="Expense" value={fmtRs(d.expense)} tone="red" />
      </div>

      <div className="bg-white rounded-2xl border border-ink/10 shadow-sm p-5 mb-5">
        <h2 className="font-semibold text-ink mb-3">Cash & Bank accounts</h2>
        <DemoTable
          keyField="account"
          columns={[
            { key: "account", label: "Account" },
            { key: "opening", label: "Opening balance", align: "right", render: (r) => fmtRs(r.opening) },
            { key: "current", label: "Current balance", align: "right", render: (r) => fmtRs(r.current) },
          ]}
          rows={d.cashBank}
        />
      </div>

      <div className="bg-white rounded-2xl border border-ink/10 shadow-sm p-5 mb-5">
        <h2 className="font-semibold text-ink mb-3">Expense breakdown</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {d.expenseBreakdown.map((e) => (
            <div key={e.num} className="rounded-xl border border-ink/10 bg-ink/[0.02] p-3">
              <div className="flex items-center gap-1.5 text-xs text-ink/50 mb-1">
                <span className="w-4 h-4 rounded-full bg-ink/10 flex items-center justify-center text-[10px]">
                  {String(e.num).padStart(2, "0")}
                </span>
                {e.label}
              </div>
              <div className="font-bold text-ink text-sm">{fmtRs(e.amount)}</div>
              <div className="text-xs text-ink/40">{e.pct}%</div>
            </div>
          ))}
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-3">
            <div className="text-xs text-ink/50 mb-1">Total Expense</div>
            <div className="font-bold text-primary text-sm">{fmtRs(d.expense)}</div>
            <div className="text-xs text-ink/40">100.00%</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-ink/10 shadow-sm p-5 mb-5">
        <h2 className="font-semibold text-ink mb-4">Expense breakdown chart</h2>
        <ExpensePieChart
          data={d.expenseBreakdown.map((e) => ({
            code: String(e.num),
            description: e.label,
            amount: e.amount,
            percent: e.pct,
          }))}
        />
      </div>

      <div className="bg-white rounded-2xl border border-ink/10 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-ink/10">
          <h2 className="font-semibold text-ink">Recent transactions</h2>
        </div>
        <ul className="divide-y divide-ink/5">
          {d.recentTransactions.map((t, i) => (
            <li key={i} className="flex items-center justify-between px-5 py-3">
              <div>
                <p className="text-sm font-medium text-ink">{t.title}</p>
                <p className="text-xs text-ink/40">{t.date}</p>
              </div>
              <span className="text-red-600 font-semibold text-sm">-{fmtRs(t.amount)}</span>
            </li>
          ))}
        </ul>
      </div>
    </DemoPageShell>
  );
}
