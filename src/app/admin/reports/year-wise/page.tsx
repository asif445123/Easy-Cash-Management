"use client";

import { useEffect, useState } from "react";
import AdminHeader from "@/components/AdminHeader";
import { safeJson } from "@/lib/api-client";

interface Row {
  code: string;
  description: string;
  years: number[];
}

interface ReportData {
  years: number[];
  incomeRows: Row[];
  expenseRows: Row[];
  totalIncomeByYear: number[];
  totalExpenseByYear: number[];
}

export default function YearWiseReportPage() {
  const [fromYear, setFromYear] = useState(new Date().getFullYear() - 3);
  const [toYear, setToYear] = useState(new Date().getFullYear());
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/admin/reports/year-wise?fromYear=${fromYear}&toYear=${toYear}`,
          { cache: "no-store" }
        );
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
  }, [fromYear, toYear]);

  return (
    <main className="min-h-screen bg-paper">
      <AdminHeader />

      <div className="max-w-6xl mx-auto px-6 pb-16">
        <h1 className="font-display text-2xl font-bold text-ink mb-1">Year Wise Report</h1>
        <p className="text-sm text-ink/50 mb-6">
          Every Income/Expense account, broken down by year.
        </p>

        <div className="bg-white rounded-2xl border border-ink/10 p-5 mb-8 grid sm:grid-cols-2 gap-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-ink/80 mb-1">From year</label>
            <input
              type="number"
              value={fromYear}
              onChange={(e) => setFromYear(Number(e.target.value) || fromYear)}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink/80 mb-1">To year</label>
            <input
              type="number"
              value={toYear}
              onChange={(e) => setToYear(Number(e.target.value) || toYear)}
              className="input"
            />
          </div>
        </div>

        {loading ? (
          <p className="text-ink/50 text-sm">Loading…</p>
        ) : error ? (
          <div className="bg-white rounded-2xl border border-danger/20 p-6 text-sm text-danger">
            {error}
          </div>
        ) : !data ? null : (
          <>
            <MatrixTable
              title="Income"
              years={data.years}
              rows={data.incomeRows}
              totals={data.totalIncomeByYear}
              tone="primary"
            />
            <MatrixTable
              title="Expenses"
              years={data.years}
              rows={data.expenseRows}
              totals={data.totalExpenseByYear}
              tone="danger"
            />
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

function MatrixTable({
  title,
  years,
  rows,
  totals,
  tone,
}: {
  title: string;
  years: number[];
  rows: Row[];
  totals: number[];
  tone: "primary" | "danger";
}) {
  const toneClass = tone === "primary" ? "text-primary" : "text-danger";
  const barColor = tone === "primary" ? "bg-primary/30" : "bg-danger/30";

  return (
    <div className="bg-white rounded-2xl border border-ink/10 overflow-x-auto mb-8">
      <div className="px-4 py-3 border-b border-ink/10">
        <h2 className="font-display font-semibold text-ink">{title}</h2>
      </div>
      <table className="w-full text-sm">
        <thead className="bg-ink/[0.03] text-ink/50 text-xs uppercase tracking-wide">
          <tr>
            <th className="text-left px-4 py-3 sticky left-0 bg-ink/[0.03] min-w-[140px]">Account</th>
            {years.map((y) => (
              <th key={y} className="text-right px-3 py-3 min-w-[110px]">
                {y}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-ink/5">
          {rows.length === 0 ? (
            <tr>
              <td colSpan={years.length + 1} className="px-4 py-6 text-center text-ink/40">
                No accounts of this type yet.
              </td>
            </tr>
          ) : (
            rows.map((r) => {
              const rowMax = Math.max(...r.years, 1);
              return (
                <tr key={r.code}>
                  <td className="px-4 py-2.5 text-ink/80 sticky left-0 bg-white">{r.description}</td>
                  {r.years.map((v, i) => (
                    <td key={i} className="px-3 py-2.5">
                      <div className="flex items-center justify-end gap-2">
                        <div className="flex-1 h-3 bg-ink/[0.06] rounded overflow-hidden max-w-[60px]">
                          <div
                            className={`h-full ${barColor}`}
                            style={{ width: `${v === 0 ? 0 : Math.max(8, (v / rowMax) * 100)}%` }}
                          />
                        </div>
                        <span className="text-ink/70 text-right w-16">
                          {v === 0 ? "—" : v.toLocaleString()}
                        </span>
                      </div>
                    </td>
                  ))}
                </tr>
              );
            })
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
