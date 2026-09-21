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

function pctChange(curr: number, prev: number): string {
  if (prev === 0) return curr === 0 ? "—" : "new";
  const pct = ((curr - prev) / prev) * 100;
  return `${pct >= 0 ? "+" : ""}${pct.toFixed(0)}%`;
}

export default function MonthWiseReportPage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/admin/reports/month-wise?year=${year}`, { cache: "no-store" });
        const json = await safeJson(res);
        if (!res.ok) {
          setError(json.message || "Could not load the report.");
          return;
        }
        setData(json as ReportData);
      } catch {
        setError("Could not reach the server.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [year]);

  return (
    <main className="min-h-screen bg-paper">
      <AdminHeader />

      <div className="max-w-6xl mx-auto px-6 pb-16">
        <h1 className="font-display text-2xl font-bold text-ink mb-1">Month Wise Report</h1>
        <p className="text-sm text-ink/50 mb-6">
          Every Income/Expense account, broken down by calendar month.
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
        ) : !data ? null : (
          <>
            <MatrixTable title="Income" rows={data.incomeRows} totals={data.totalIncomeByMonth} tone="primary" />
            <MatrixTable title="Expenses" rows={data.expenseRows} totals={data.totalExpenseByMonth} tone="danger" />

            <div className="bg-white rounded-2xl border border-ink/10 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-ink/[0.03] text-ink/50 text-xs uppercase tracking-wide">
                  <tr>
                    <th className="text-left px-4 py-3 sticky left-0 bg-ink/[0.03]">Average per month</th>
                    {MONTH_NAMES.map((m) => (
                      <th key={m} className="text-right px-3 py-3">
                        {m}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/5">
                  <AverageRow label="Avg income" values={data.totalIncomeByMonth} tone="primary" />
                  <AverageRow label="Avg expense" values={data.totalExpenseByMonth} tone="danger" />
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

function MatrixTable({
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
              <th key={m} className="text-right px-3 py-3">
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
                {r.months.map((v, i) => (
                  <td key={i} className="px-3 py-2.5 text-right text-ink/70">
                    {v === 0 ? "—" : v.toLocaleString()}
                  </td>
                ))}
              </tr>
            ))
          )}
          <tr className="bg-ink/[0.03] font-semibold">
            <td className="px-4 py-2.5 text-ink sticky left-0 bg-ink/[0.03]">Total</td>
            {totals.map((v, i) => (
              <td key={i} className={`px-3 py-2.5 text-right ${toneClass}`}>
                {v.toLocaleString()}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function AverageRow({ label, values, tone }: { label: string; values: number[]; tone: "primary" | "danger" }) {
  const toneClass = tone === "primary" ? "text-primary" : "text-danger";
  return (
    <tr>
      <td className="px-4 py-2.5 text-ink/80 sticky left-0 bg-white font-medium">{label}</td>
      {values.map((v, i) => (
        <td key={i} className="px-3 py-2.5 text-right">
          <div className={toneClass}>{v.toLocaleString()}</div>
          <div className="text-xs text-ink/40">{i === 0 ? "—" : pctChange(v, values[i - 1])}</div>
        </td>
      ))}
    </tr>
  );
}
