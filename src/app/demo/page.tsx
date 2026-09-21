"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { FaPlus, FaChartBar } from "react-icons/fa";
import { demoSummary, demoTransactions } from "@/data/demoData";
import { demoAddEntryItems, demoReportItems } from "@/lib/demoNav";
import DemoMenu from "@/components/DemoMenu";

export default function DemoPage() {
  const router = useRouter();

  async function handleDemoLogout() {
    const result = await Swal.fire({
      icon: "question",
      title: "Leave the demo?",
      showCancelButton: true,
      confirmButtonText: "Leave demo",
      confirmButtonColor: "#B3452C",
    });
    if (result.isConfirmed) {
      router.push("/");
    }
  }

  return (
    <main className="min-h-screen bg-paper">
      <header className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between flex-wrap gap-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-accent font-display font-bold">
            ₨
          </span>
          <span className="font-display font-semibold text-lg tracking-tight">EasyCash</span>
        </Link>
        <div className="flex items-center gap-3 flex-wrap">
          <DemoMenu label="Add Entry" icon={FaPlus} items={demoAddEntryItems} variant="primary" />
          <DemoMenu label="Show Reports" icon={FaChartBar} items={demoReportItems} variant="outline" />
          <Link
            href="/demo/dashboard"
            className="text-sm font-medium text-ink/70 hover:text-ink transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 rounded-full bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors"
          >
            Create real account
          </Link>
          <button
            onClick={handleDemoLogout}
            className="px-4 py-2 rounded-full border border-ink/15 text-sm font-medium hover:bg-ink/5 transition-colors"
          >
            Log out
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6">
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
