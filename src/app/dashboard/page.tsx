"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import AdminHeader from "@/components/AdminHeader";
import ExpensePieChart from "@/components/ExpensePieChart";

interface Transaction {
  id: string;
  title: string;
  date: string;
  amount: number;
  type: "income" | "expense";
}

interface CashBankAccount {
  code: string;
  description: string;
  opening: number;
  balance: number;
  isCash?: boolean;        // optional — falls back to name match
  hasTelly?: boolean;      // optional — defaults to false
  tellyMatched?: boolean;  // optional — defaults to false
}

interface ExpenseBreakdownItem {
  code: string;
  description: string;
  amount: number;
  percent: number;
}

interface Summary {
  balance: number;
  income: number;
  expense: number;
  cashBankAccounts: CashBankAccount[];
  expenseBreakdown: ExpenseBreakdownItem[];
  recentTransactions: Transaction[];
}

const emptySummary: Summary = {
  balance: 0,
  income: 0,
  expense: 0,
  cashBankAccounts: [],
  expenseBreakdown: [],
  recentTransactions: [],
};

const CHART_COLORS = [
  "#2563EB",
  "#B3452C",
  "#5B8C5A",
  "#7C3AED",
  "#0891B2",
  "#D97706",
  "#059669",
  "#DB2777",
  "#4B5563",
  "#9333EA",
];

function getChartColor(index: number): string {
  if (index < CHART_COLORS.length) return CHART_COLORS[index];
  const hue = (index * 137.508) % 360;
  return `hsl(${hue}, 65%, 45%)`;
}

function toLocalDateStr(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function firstOfMonth() {
  const d = new Date();
  return toLocalDateStr(new Date(d.getFullYear(), d.getMonth(), 1));
}

export default function DashboardPage() {
  const { loading: authLoading } = useAuth();
  const [summary, setSummary] = useState<Summary>(emptySummary);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [from, setFrom] = useState(firstOfMonth);
  const [to, setTo] = useState(() => toLocalDateStr(new Date()));

  useEffect(() => {
    async function loadSummary() {
      setLoadingSummary(true);
      try {
        const res = await fetch(`/api/dashboard/summary?from=${from}&to=${to}`, { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setSummary(data);
        } else {
          setSummary(emptySummary);
        }
      } catch {
        setSummary(emptySummary);
      } finally {
        setLoadingSummary(false);
      }
    }
    loadSummary();
  }, [from, to]);

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center text-ink/50">Loading…</div>;
  }

  return (
    <main className="min-h-screen bg-paper">
      <AdminHeader />

      <div className="max-w-5xl mx-auto px-6">
        <div className="bg-white rounded-2xl border border-ink/10 p-6 mb-8 grid sm:grid-cols-2 gap-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-ink/80 mb-1">From</label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full rounded-lg border border-ink/15 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink/80 mb-1">To</label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full rounded-lg border border-ink/15 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-8">
          <StatCard label="Income" value={summary.income} tone="primary" loading={loadingSummary} />
          <StatCard label="Expense" value={summary.expense} tone="danger" loading={loadingSummary} />
          {!loadingSummary &&
            summary.cashBankAccounts.map((a) => <CashAccountCard key={a.code} account={a} />)}
          <StatCard label="Balance" value={summary.balance} tone="primary" loading={loadingSummary} />
        </div>

        {!loadingSummary && summary.expenseBreakdown.length > 0 && (
          <div className="bg-white rounded-2xl border border-ink/10 p-5 mb-8">
            <h2 className="font-display font-semibold text-ink mb-4">Expense breakdown</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {summary.expenseBreakdown.map((item, i) => {
                const color = getChartColor(i);
                return (
                  <div
                    key={item.code}
                    className="rounded-xl border border-ink/10 flex flex-col overflow-hidden"
                    style={{ borderTopColor: color, borderTopWidth: 3 }}
                  >
                    <div className="px-3 py-2 text-xs font-semibold text-ink/70 bg-ink/[0.04] truncate flex items-center gap-1.5">
                      <span
                        className="inline-flex items-center justify-center w-5 h-5 shrink-0 rounded-full text-[10px] font-bold text-white"
                        style={{ backgroundColor: color }}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="truncate">{item.description}</span>
                    </div>
                    <div className="px-3 py-3 text-center text-ink font-bold text-sm">
                      Rs {item.amount.toLocaleString()}
                    </div>
                    <div className="px-3 py-1.5 text-center text-xs text-ink/50 bg-ink/[0.02]">
                      {item.percent.toFixed(2)}%
                    </div>
                  </div>
                );
              })}
              <div className="rounded-xl border border-ink/15 flex flex-col">
                <div className="px-3 py-2 text-xs font-semibold text-ink/70 bg-ink/[0.06] rounded-t-xl truncate">
                  Total Expense
                </div>
                <div className="px-3 py-3 text-center text-ink font-bold text-sm">
                  Rs {summary.expense.toLocaleString()}
                </div>
                <div className="px-3 py-1.5 text-center text-xs text-ink/50 bg-ink/[0.02] rounded-b-xl">
                  100.00%
                </div>
              </div>
            </div>
          </div>
        )}

        {!loadingSummary && summary.expenseBreakdown.length > 0 && (
          <div className="bg-white rounded-2xl border border-ink/10 p-5 mb-16">
            <h2 className="font-display font-semibold text-ink mb-4">Expense breakdown chart</h2>
            <ExpensePieChart data={summary.expenseBreakdown} />
          </div>
        )}
      </div>
    </main>
  );
}

function CashAccountCard({ account }: { account: CashBankAccount }) {
  const router = useRouter();

  // If the API sends isCash, trust it. Otherwise fall back to a name match
  // so "Cash in Hand" gets a badge and "UBL Bank" does not.
  const isCash =
    typeof account.isCash === "boolean"
      ? account.isCash
      : /cash|hand|petty/i.test(account.description || "");

  const matched = account.tellyMatched === true;

  function openTelly() {
    router.push(`/admin/telly-cash?accountCode=${encodeURIComponent(account.code)}`);
  }

  return (
    <div className="bg-white rounded-2xl border border-ink/10 p-5">
      <div className="flex items-start justify-between gap-2 mb-1">
        <p className="text-xs uppercase tracking-widest text-ink/40 truncate">
          {account.description}
        </p>

        {isCash && (
          <button
            type="button"
            onClick={matched ? undefined : openTelly}
            disabled={matched}
            aria-label={matched ? "Cash tallied — matches system" : "Cash not tallied — open Telly Cash"}
            title={
              matched
                ? "Telly matched with system balance"
                : account.hasTelly
                  ? "Telly does not match — click to recount"
                  : "Cash not tallied yet — click to count"
            }
            className={`shrink-0 w-6 h-6 rounded-full grid place-items-center border transition-colors ${
              matched
                ? "bg-emerald-50 border-emerald-300 text-emerald-600 cursor-default"
                : "bg-red-50 border-red-300 text-red-600 hover:bg-red-100 cursor-pointer"
            }`}
          >
            {matched ? <CheckIcon /> : <CrossIcon />}
          </button>
        )}
      </div>
      <p className="font-display text-2xl font-bold text-ink">
        Rs {account.balance.toLocaleString()}
      </p>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-3.5 h-3.5"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function CrossIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-3.5 h-3.5"
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function StatCard({
  label,
  value,
  tone,
  loading,
}: {
  label: string;
  value: number;
  tone: "ink" | "primary" | "danger";
  loading: boolean;
}) {
  const toneClass = tone === "primary" ? "text-primary" : tone === "danger" ? "text-danger" : "text-ink";
  return (
    <div className="bg-white rounded-2xl border border-ink/10 p-5">
      <p className="text-xs uppercase tracking-widest text-ink/40 mb-1">{label}</p>
      <p className={`font-display text-2xl font-bold ${toneClass}`}>
        {loading ? "…" : `Rs ${value.toLocaleString()}`}
      </p>
    </div>
  );
}