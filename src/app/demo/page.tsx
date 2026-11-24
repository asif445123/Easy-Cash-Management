"use client";

import { demoSummary, demoTransactions } from "@/data/demoData";

export default function DemoPage() {
  return (
    <main className="min-h-screen bg-paper">
      <div className="max-w-5xl mx-auto px-6 pb-16">
        <h1 className="font-display text-2xl font-bold text-ink mb-4">Demo Overview</h1>

        <div className="bg-accent/15 border border-accent/40 text-ink/80 text-sm rounded-xl px-4 py-3 mb-8">
          You&apos;re viewing <strong>demo data</strong>. Nothing here is saved or connected to a real
          account.
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <StatCard label="Balance" value={demoSummary.balance} tone="ink" />
          <StatCard label="Income" value={demoSummary.income} tone="primary" />
          <StatCard label="Expense" value={demoSummary.expense} tone="danger" />
        </div>

        <div className="bg-white rounded-2xl border border-ink/10 overflow-hidden mb-16">
          <div className="px-5 py-4 border-b border-ink/10">
            <h2 className="font-display font-semibold text-ink">Recent transactions</h2>
          </div>
          <ul className="divide-y divide-ink/5">
            {demoTransactions.map((t) => (
              <li key={t.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-ink">{t.title}</p>
                  <p className="text-xs text-ink/40">{t.date}</p>
                </div>
                <span
                  className={
                    t.type === "income"
                      ? "text-primary font-semibold text-sm"
                      : "text-danger font-semibold text-sm"
                  }
                >
                  {t.type === "income" ? "+" : "-"}Rs {t.amount.toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "ink" | "primary" | "danger";
}) {
  const toneClass = tone === "primary" ? "text-primary" : tone === "danger" ? "text-danger" : "text-ink";
  return (
    <div className="bg-white rounded-2xl border border-ink/10 p-5">
      <p className="text-xs uppercase tracking-widest text-ink/40 mb-1">{label}</p>
      <p className={`font-display text-2xl font-bold ${toneClass}`}>Rs {value.toLocaleString()}</p>
    </div>
  );
}
