"use client";

import { useEffect, useState } from "react";
import AdminHeader from "@/components/AdminHeader";
import { safeJson } from "@/lib/api-client";

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

interface Row {
  code: string;
  description: string;
  months: number[];
}

interface ReportData {
  year: number;
  incomeRows: Row[];
  expenseRows: Row[];
  totalIncomeByMonth: number[];
  totalExpenseByMonth: number[];
}

/** % change from `prev` to `curr` — e.g. 7000 -> 14000 is "+100%". */
function pctChange(curr: number, prev: number): { text: string; up: boolean } | null {
  if (prev === 0 && curr === 0) return null;
  if (prev === 0) return { text: `+${curr.toLocaleString()}`, up: true };
  const pct = ((curr - prev) / prev) * 100;
  return { text: `${pct >= 0 ? "+" : ""}${pct.toFixed(0)}%`, up: pct >= 0 };
}

/** Merges a year's rows with the same rows from the year before, so
 * January can be compared against the previous December too. */
function withPriorDecember(rows: Row[], priorRows: Row[]): Row[] {
  const priorByCode = new Map(priorRows.map((r) => [r.code, r.months[11]]));
  return rows.map((r) => ({
    ...r,
    months: [priorByCode.get(r.code) ?? 0, ...r.months], // index 0 = prior Dec, 1..12 = Jan..Dec
  }));
}

export default function MonthWiseComparisonPage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [current, setCurrent] = useState<ReportData | null>(null);
  const [prior, setPrior] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [resCurrent, resPrior] = await Promise.all([
          fetch(`/api/admin/reports/month-wise?year=${year}`, { cache: "no-store" }),
          fetch(`/api/admin/reports/month-wise?year=${year - 1}`, { cache: "no-store" }),
        ]);
        const jsonCurrent = await safeJson(resCurrent);
        const jsonPrior = await safeJson(resPrior);
        if (!resCurrent.ok) {
          setError(jsonCurrent.message || "Could not load the report.");
          return;
        }
        setCurrent(jsonCurrent as ReportData);
        setPrior(resPrior.ok ? (jsonPrior as ReportData) : null);
      } catch {
        setError("Could not reach the server.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [year]);

  const incomeRows = current && prior ? withPriorDecember(current.incomeRows, prior.incomeRows) : [];
  const expenseRows = current && prior ? withPriorDecember(current.expenseRows, prior.expenseRows) : [];
  const totalIncome = current && prior ? [prior.totalIncomeByMonth[11], ...current.totalIncomeByMonth] : [];
  const totalExpense = current && prior ? [prior.totalExpenseByMonth[11], ...current.totalExpenseByMonth] : [];

  return (
    <main className="min-h-screen bg-paper">
      <AdminHeader />

      <div className="max-w-6xl mx-auto px-6 pb-16">
        <h1 className="font-display text-2xl font-bold text-ink mb-1">Month Wise Comparison</h1>
        <p className="text-sm text-ink/50 mb-6">
          Each month compared to the one right before it — e.g. House Rent Rs 14,000 in August vs
          Rs 7,000 in July shows as +100%.
        </p>

        <div className="bg-white rounded-2xl border border-ink/10 p-5 mb-8 max-w-xs">
          <label className="block text-sm font-medium text-ink/80 mb-1">Year</label>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value) || new Date().getFullYear())}
            className="input"
          />
        </div>

        {loading ? (
          <p className="text-ink/50 text-sm">Loading…</p>
        ) : error ? (
          <div className="bg-white rounded-2xl border border-danger/20 p-6 text-sm text-danger">
            {error}
          </div>
        ) : !current ? null : (
          <>
            <ComparisonTable title="Income" rows={incomeRows} totals={totalIncome} tone="primary" />
            <ComparisonTable title="Expenses" rows={expenseRows} totals={totalExpense} tone="danger" />
          </>
        )}
      </div>

      <style jsx global>{`
        .input {
          width: 100%;
          border: 1px solid rgba(0, 0, 0, 0.12);
          border-radius: 0.5rem;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
        }
        .input:focus {
          outline: none;
          box-shadow: 0 0 0 2px rgba(14, 124, 74, 0.25);
        }
      `}</style>
    </main>
  );
}

function ComparisonTable({
  title,
  rows,
  totals,
  tone,
}: {
  title: string;
  rows: Row[];
  totals: number[];
  tone: "primary" | "danger";
}) {
  const toneClass = tone === "primary" ? "text-primary" : "text-danger";
  return (
    <div className="bg-white rounded-2xl border border-ink/10 overflow-x-auto mb-8">
      <div className="px-4 py-3 border-b border-ink/10">
        <h2 className="font-display font-semibold text-ink">{title}</h2>
      </div>
      <table className="w-full text-sm">
        <thead className="bg-ink/[0.03] text-ink/50 text-xs uppercase tracking-wide">
          <tr>
            <th className="text-left px-4 py-3 sticky left-0 bg-ink/[0.03] min-w-[140px]">Account</th>
            {MONTH_NAMES.map((m) => (
              <th key={m} className="text-right px-3 py-3 min-w-[90px]">
                {m}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-ink/5">
          {rows.length === 0 ? (
            <tr>
              <td colSpan={13} className="px-4 py-6 text-center text-ink/40">
                No accounts of this type yet.
              </td>
            </tr>
          ) : (
            rows.map((r) => (
              <tr key={r.code}>
                <td className="px-4 py-2.5 text-ink/80 sticky left-0 bg-white">{r.description}</td>
                {/* months[0] is prior December, only used as a comparison base for January — skip it as its own column */}
                {r.months.slice(1).map((v, i) => {
                  const prevValue = r.months[i]; // i.e. r.months[(i+1)-1]
                  const change = pctChange(v, prevValue);
                  return (
                    <td key={i} className="px-3 py-2.5 text-right">
                      <div className="text-ink/80">{v === 0 ? "—" : v.toLocaleString()}</div>
                      {change && (
                        <div className={`text-xs font-medium ${change.up ? "text-primary" : "text-danger"}`}>
                          {change.text}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
          <tr className="bg-ink/[0.03] font-semibold">
            <td className="px-4 py-2.5 text-ink sticky left-0 bg-ink/[0.03]">Total</td>
            {totals.slice(1).map((v, i) => {
              const prevValue = totals[i];
              const change = pctChange(v, prevValue);
              return (
                <td key={i} className="px-3 py-2.5 text-right">
                  <div className={toneClass}>{v.toLocaleString()}</div>
                  {change && (
                    <div className={`text-xs font-normal ${change.up ? "text-primary" : "text-danger"}`}>
                      {change.text}
                    </div>
                  )}
                </td>
              );
            })}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
