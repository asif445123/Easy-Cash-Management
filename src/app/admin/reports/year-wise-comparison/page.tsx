"use client";

import { useEffect, useState, Fragment } from "react";
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

interface Comparison {
  diff: number;
  comparison: "INC" | "DEC" | "EQL";
  percentage: string;
}

function compare(curr: number, prev: number): Comparison {
  const diff = curr - prev;
  if (diff === 0) return { diff, comparison: "EQL", percentage: prev === 0 ? "—" : "0%" };
  const comparison = diff > 0 ? "INC" : "DEC";
  if (prev === 0) return { diff, comparison, percentage: "#DIV/0!" };
  const pct = (diff / prev) * 100;
  return { diff, comparison, percentage: `${pct.toFixed(0)}%` };
}

export default function YearWiseComparisonPage() {
  const [fromYear, setFromYear] = useState(new Date().getFullYear() - 4);
  const [toYear, setToYear] = useState(new Date().getFullYear());
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        // Fetch one extra year before fromYear so the first displayed
        // year still has a "previous year" to compare against.
        const res = await fetch(
          `/api/admin/reports/year-wise?fromYear=${fromYear - 1}&toYear=${toYear}`,
          { cache: "no-store" }
        );
        const json = await safeJson(res);
        if (!res.ok) {
          setError(json.message || "Could not load the comparison.");
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
        <h1 className="font-display text-2xl font-bold text-ink mb-1">Year Wise Comparison</h1>
        <p className="text-sm text-ink/50 mb-6">Each year compared to the one right before it.</p>

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
          <div className="bg-white rounded-2xl border border-danger/20 p-6 text-sm text-danger">{error}</div>
        ) : !data ? null : (
          <>
            <ComparisonTable
              title="Income"
              years={data.years.slice(1)}
              rows={data.incomeRows}
              totals={data.totalIncomeByYear}
              tone="primary"
            />
            <ComparisonTable
              title="Expenses"
              years={data.years.slice(1)}
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

function ComparisonTable({
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

  return (
    <div className="bg-white rounded-2xl border border-ink/10 overflow-x-auto mb-8">
      <div className="px-4 py-3 border-b border-ink/10">
        <h2 className="font-display font-semibold text-ink">{title}</h2>
      </div>
      <table className="w-full text-sm">
        <thead className="bg-ink/[0.03] text-ink/50 text-xs uppercase tracking-wide">
          <tr>
            <th className="text-left px-4 py-3 sticky left-0 bg-ink/[0.03] min-w-[140px]" rowSpan={2}>
              Account
            </th>
            {years.map((y) => (
              <th key={y} className="text-center px-3 py-2 border-l border-ink/10" colSpan={4}>
                {y}
              </th>
            ))}
          </tr>
          <tr>
            {years.map((y) => (
              <Fragment key={y}>
                <th className="text-right px-2 py-2 border-l border-ink/10 font-normal">Expenses</th>
                <th className="text-right px-2 py-2 font-normal">Diff</th>
                <th className="text-center px-2 py-2 font-normal">Cmp</th>
                <th className="text-right px-2 py-2 font-normal">%</th>
              </Fragment>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-ink/5">
          {rows.length === 0 ? (
            <tr>
              <td colSpan={1 + years.length * 4} className="px-4 py-6 text-center text-ink/40">
                No accounts of this type yet.
              </td>
            </tr>
          ) : (
            rows.map((r) => (
              <tr key={r.code}>
                <td className="px-4 py-2.5 text-ink/80 sticky left-0 bg-white">{r.description}</td>
                {years.map((y, i) => {
                  const curr = r.years[i + 1];
                  const prev = r.years[i];
                  const c = compare(curr, prev);
                  return (
                    <Fragment key={y}>
                      <td className="px-2 py-2.5 text-right border-l border-ink/5 text-ink/80">
                        {curr === 0 ? "—" : curr.toLocaleString()}
                      </td>
                      <td className={`px-2 py-2.5 text-right ${c.diff >= 0 ? "text-primary" : "text-danger"}`}>
                        {c.diff.toLocaleString()}
                      </td>
                      <td className="px-2 py-2.5 text-center text-ink/50 text-xs">{c.comparison}</td>
                      <td className={`px-2 py-2.5 text-right ${c.diff >= 0 ? "text-primary" : "text-danger"}`}>
                        {c.percentage}
                      </td>
                    </Fragment>
                  );
                })}
              </tr>
            ))
          )}
          <tr className="bg-ink/[0.03] font-semibold">
            <td className="px-4 py-2.5 text-ink sticky left-0 bg-ink/[0.03]">Total</td>
            {years.map((y, i) => {
              const curr = totals[i + 1];
              const prev = totals[i];
              const c = compare(curr, prev);
              return (
                <Fragment key={y}>
                  <td className={`px-2 py-2.5 text-right border-l border-ink/10 ${toneClass}`}>
                    {curr.toLocaleString()}
                  </td>
                  <td className={`px-2 py-2.5 text-right ${c.diff >= 0 ? "text-primary" : "text-danger"}`}>
                    {c.diff.toLocaleString()}
                  </td>
                  <td className="px-2 py-2.5 text-center text-ink/50 text-xs">{c.comparison}</td>
                  <td className={`px-2 py-2.5 text-right ${c.diff >= 0 ? "text-primary" : "text-danger"}`}>
                    {c.percentage}
                  </td>
                </Fragment>
              );
            })}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
