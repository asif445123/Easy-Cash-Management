"use client";

import { useState } from "react";
import AdminHeader from "@/components/AdminHeader";

interface Account {
  _id: string;
  code: string;
  description: string;
}
interface Row {
  account: Account;
  balance: number;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function ReceivablePayableReportPage() {
  const [asOf, setAsOf] = useState(today());
  const [mode, setMode] = useState<"receivable" | "payable" | "all">("receivable");
  const [receivable, setReceivable] = useState<Row[]>([]);
  const [payable, setPayable] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  async function loadReport(e?: React.FormEvent) {
    e?.preventDefault();
    setLoading(true);
    try {
      const params = new URLSearchParams({ asOf, mode });
      const res = await fetch(`/api/admin/reports/receivable-payable?${params}`, { cache: "no-store" });
      const data = await res.json();
      setReceivable(data.receivable || []);
      setPayable(data.payable || []);
      setLoaded(true);
    } finally {
      setLoading(false);
    }
  }

  const totalReceivable = receivable.reduce((s, r) => s + r.balance, 0);
  const totalPayable = payable.reduce((s, r) => s + r.balance, 0);

  return (
    <main className="min-h-screen bg-paper">
      <AdminHeader />

      <div className="max-w-4xl mx-auto px-6 pb-16">
        <h1 className="font-display text-2xl font-bold text-ink mb-6">Accounts Receivable / Payable</h1>

        <form onSubmit={loadReport} className="bg-white rounded-2xl border border-ink/10 p-6 mb-6 space-y-4">
          <Field label="As of date">
            <input type="date" required value={asOf} onChange={(e) => setAsOf(e.target.value)} className="input max-w-xs" />
          </Field>

          <div className="flex items-center gap-4 text-sm">
            {(["receivable", "payable", "all"] as const).map((m) => (
              <label key={m} className="flex items-center gap-2 cursor-pointer select-none">
                <input type="radio" name="mode" checked={mode === m} onChange={() => setMode(m)} className="text-primary" />
                {m === "receivable" ? "Receivable" : m === "payable" ? "Payable" : "All"}
              </label>
            ))}
          </div>

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

        {loaded && !loading && (
          <div className={mode === "all" ? "grid md:grid-cols-2 gap-6" : ""}>
            {mode !== "payable" && (
              <ListTable title="Receivable" rows={receivable} total={totalReceivable} />
            )}
            {mode !== "receivable" && (
              <ListTable title="Payable" rows={payable} total={totalPayable} />
            )}
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

function ListTable({ title, rows, total }: { title: string; rows: Row[]; total: number }) {
  return (
    <div className="bg-white rounded-2xl border border-ink/10 overflow-x-auto">
      <p className="px-5 pt-4 text-sm font-semibold text-ink/70">{title}</p>
      <table className="w-full text-sm">
        <thead className="bg-ink/[0.03] text-ink/50 text-xs uppercase tracking-wide">
          <tr>
            <th className="text-left px-5 py-3">Code</th>
            <th className="text-left px-5 py-3">Description</th>
            <th className="text-right px-5 py-3">Balance</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink/5">
          {rows.length === 0 ? (
            <tr><td colSpan={3} className="px-5 py-6 text-center text-ink/40">None.</td></tr>
          ) : (
            rows.map((r) => (
              <tr key={r.account._id}>
                <td className="px-5 py-3 font-medium text-ink">{r.account.code}</td>
                <td className="px-5 py-3 text-ink/80">{r.account.description}</td>
                <td className="px-5 py-3 text-right text-ink/70">{r.balance.toFixed(2)}</td>
              </tr>
            ))
          )}
        </tbody>
        <tfoot className="bg-ink/[0.03] font-semibold">
          <tr>
            <td className="px-5 py-3" colSpan={2}>Total</td>
            <td className="px-5 py-3 text-right">{total.toFixed(2)}</td>
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
