"use client";

import { useState } from "react";
import AdminHeader from "@/components/AdminHeader";

interface Row {
  label: string;
  serial?: number;
  debit: number;
  credit: number;
}
interface Period {
  rows: Row[];
  totalDebit: number;
  totalCredit: number;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}
function firstOfMonth() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
}

export default function JournalVoucherReportPage() {
  const [from, setFrom] = useState(firstOfMonth());
  const [to, setTo] = useState(today());
  const [groupBy, setGroupBy] = useState<"date" | "month">("date");
  const [compare, setCompare] = useState(false);
  const [compareFrom, setCompareFrom] = useState("");
  const [compareTo, setCompareTo] = useState("");
  const [current, setCurrent] = useState<Period | null>(null);
  const [comparison, setComparison] = useState<Period | null>(null);
  const [loading, setLoading] = useState(false);

  async function loadReport(e?: React.FormEvent) {
    e?.preventDefault();
    setLoading(true);
    try {
      const params = new URLSearchParams({ from, to, groupBy });
      if (compare && compareFrom && compareTo) {
        params.set("compare", "true");
        params.set("compareFrom", compareFrom);
        params.set("compareTo", compareTo);
      }
      const res = await fetch(`/api/admin/reports/journal-voucher?${params}`, { cache: "no-store" });
      const data = await res.json();
      setCurrent(data.current);
      setComparison(data.comparison);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-paper">
      <AdminHeader />

      <div className="max-w-4xl mx-auto px-6 pb-16">
        <h1 className="font-display text-2xl font-bold text-ink mb-6">Journal Voucher Report</h1>

        <form onSubmit={loadReport} className="bg-white rounded-2xl border border-ink/10 p-6 mb-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="From">
              <input type="date" required value={from} onChange={(e) => setFrom(e.target.value)} className="input" />
            </Field>
            <Field label="To">
              <input type="date" required value={to} onChange={(e) => setTo(e.target.value)} className="input" />
            </Field>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <ViewToggle groupBy={groupBy} setGroupBy={setGroupBy} />
            <label className="flex items-center gap-2 text-sm text-ink/70 cursor-pointer select-none">
              <input type="checkbox" checked={compare} onChange={(e) => setCompare(e.target.checked)} className="rounded border-ink/30 text-primary" />
              Compare with another period
            </label>
          </div>

          {compare && (
            <div className="grid sm:grid-cols-2 gap-4 bg-ink/[0.03] rounded-lg p-4">
              <Field label="Compare from">
                <input type="date" value={compareFrom} onChange={(e) => setCompareFrom(e.target.value)} className="input" />
              </Field>
              <Field label="Compare to">
                <input type="date" value={compareTo} onChange={(e) => setCompareTo(e.target.value)} className="input" />
              </Field>
            </div>
          )}

          <div className="flex gap-3">
            <button type="submit" className="px-5 py-2.5 rounded-lg bg-primary text-white font-semibold hover:bg-primary-dark transition-colors">
              Preview
            </button>
            <button type="button" onClick={() => window.print()} className="px-5 py-2.5 rounded-lg border border-ink/15 text-ink font-semibold hover:bg-ink/5 transition-colors">
              Print
            </button>
          </div>
        </form>

        {loading && <p className="text-ink/50 text-sm">Loading…</p>}

        {current && !loading && (
          <div className={comparison ? "grid md:grid-cols-2 gap-6" : ""}>
            <PeriodTable title={comparison ? `${from} to ${to}` : undefined} period={current} groupBy={groupBy} />
            {comparison && <PeriodTable title={`${compareFrom} to ${compareTo}`} period={comparison} groupBy={groupBy} />}
          </div>
        )}
      </div>

      <style jsx global>{`
        .input { width: 100%; border: 1px solid rgba(0,0,0,0.12); border-radius: 0.5rem; padding: 0.5rem 0.75rem; font-size: 0.875rem; }
        .input:focus { outline: none; box-shadow: 0 0 0 2px rgba(14,124,74,0.25); }
      `}</style>
    </main>
  );
}

function ViewToggle({ groupBy, setGroupBy }: { groupBy: "date" | "month"; setGroupBy: (v: "date" | "month") => void }) {
  return (
    <div className="flex rounded-lg border border-ink/15 overflow-hidden text-sm">
      <button
        type="button"
        onClick={() => setGroupBy("date")}
        className={`px-3 py-1.5 ${groupBy === "date" ? "bg-primary text-white" : "text-ink/70 hover:bg-ink/5"}`}
      >
        Date wise
      </button>
      <button
        type="button"
        onClick={() => setGroupBy("month")}
        className={`px-3 py-1.5 ${groupBy === "month" ? "bg-primary text-white" : "text-ink/70 hover:bg-ink/5"}`}
      >
        Month wise
      </button>
    </div>
  );
}

function PeriodTable({ title, period, groupBy }: { title?: string; period: Period; groupBy: "date" | "month" }) {
  return (
    <div className="bg-white rounded-2xl border border-ink/10 overflow-x-auto">
      {title && <p className="px-5 pt-4 text-sm font-semibold text-ink/70">{title}</p>}
      <table className="w-full text-sm">
        <thead className="bg-ink/[0.03] text-ink/50 text-xs uppercase tracking-wide">
          <tr>
            <th className="text-left px-5 py-3">{groupBy === "date" ? "Date" : "Month"}</th>
            {groupBy === "date" && <th className="text-left px-5 py-3">Serial</th>}
            <th className="text-right px-5 py-3">Debit</th>
            <th className="text-right px-5 py-3">Credit</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink/5">
          {period.rows.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-5 py-8 text-center text-ink/40">No entries in this period.</td>
            </tr>
          ) : (
            period.rows.map((r, i) => (
              <tr key={i}>
                <td className="px-5 py-3 text-ink/80">{r.label}</td>
                {groupBy === "date" && <td className="px-5 py-3 text-ink/60">JV {r.serial}</td>}
                <td className="px-5 py-3 text-right text-ink/70">{r.debit.toFixed(2)}</td>
                <td className="px-5 py-3 text-right text-ink/70">{r.credit.toFixed(2)}</td>
              </tr>
            ))
          )}
        </tbody>
        <tfoot className="bg-ink/[0.03] font-semibold">
          <tr>
            <td className="px-5 py-3" colSpan={groupBy === "date" ? 2 : 1}>Total</td>
            <td className="px-5 py-3 text-right">{period.totalDebit.toFixed(2)}</td>
            <td className="px-5 py-3 text-right">{period.totalCredit.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-ink/80 mb-1">{label}</label>
      {children}
    </div>
  );
}
