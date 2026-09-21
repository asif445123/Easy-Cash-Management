"use client";

import { useEffect, useState } from "react";
import AdminHeader from "@/components/AdminHeader";

interface AccountType {
  _id: string;
  type: string;
}
interface Account {
  _id: string;
  code: string;
  description: string;
}
interface Row {
  account: Account;
  debit: number;
  credit: number;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function TrialBalance2ColPage() {
  const [accountTypes, setAccountTypes] = useState<AccountType[]>([]);
  const [type, setType] = useState("");
  const [asOf, setAsOf] = useState(today());
  const [compare, setCompare] = useState(false);
  const [compareAsOf, setCompareAsOf] = useState("");
  const [current, setCurrent] = useState<Row[]>([]);
  const [comparison, setComparison] = useState<Row[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/admin/account-types", { cache: "no-store" }).then((r) => r.json()).then((d) => setAccountTypes(d.accountTypes || []));
  }, []);

  async function loadReport(e?: React.FormEvent) {
    e?.preventDefault();
    setLoading(true);
    try {
      const params = new URLSearchParams({ asOf });
      if (type) params.set("type", type);
      if (compare && compareAsOf) {
        params.set("compare", "true");
        params.set("compareAsOf", compareAsOf);
      }
      const res = await fetch(`/api/admin/reports/trial-balance-2col?${params}`, { cache: "no-store" });
      const data = await res.json();
      setCurrent(data.current || []);
      setComparison(data.comparison);
      setLoaded(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-paper">
      <AdminHeader />

      <div className="max-w-4xl mx-auto px-6 pb-16">
        <h1 className="font-display text-2xl font-bold text-ink mb-6">Trial Balance (2 Column)</h1>

        <form onSubmit={loadReport} className="bg-white rounded-2xl border border-ink/10 p-6 mb-6 space-y-4">
          <Field label="Type">
            <select value={type} onChange={(e) => setType(e.target.value)} className="input">
              <option value="">All types</option>
              {accountTypes.map((t) => (
                <option key={t._id} value={t.type}>{t.type}</option>
              ))}
            </select>
          </Field>

          <Field label="As of date">
            <input type="date" required value={asOf} onChange={(e) => setAsOf(e.target.value)} className="input max-w-xs" />
          </Field>

          <label className="flex items-center gap-2 text-sm text-ink/70 cursor-pointer select-none">
            <input type="checkbox" checked={compare} onChange={(e) => setCompare(e.target.checked)} className="rounded border-ink/30 text-primary" />
            Compare with another date
          </label>

          {compare && (
            <Field label="Compare as of">
              <input type="date" value={compareAsOf} onChange={(e) => setCompareAsOf(e.target.value)} className="input max-w-xs" />
            </Field>
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

        {loaded && !loading && (
          <div className={comparison ? "grid md:grid-cols-2 gap-6" : ""}>
            <TrialTable title={comparison ? `As of ${asOf}` : undefined} rows={current} />
            {comparison && <TrialTable title={`As of ${compareAsOf}`} rows={comparison} />}
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

function TrialTable({ title, rows }: { title?: string; rows: Row[] }) {
  const totalDebit = rows.reduce((s, r) => s + r.debit, 0);
  const totalCredit = rows.reduce((s, r) => s + r.credit, 0);

  return (
    <div className="bg-white rounded-2xl border border-ink/10 overflow-x-auto">
      {title && <p className="px-5 pt-4 text-sm font-semibold text-ink/70">{title}</p>}
      <table className="w-full text-sm">
        <thead className="bg-ink/[0.03] text-ink/50 text-xs uppercase tracking-wide">
          <tr>
            <th className="text-left px-5 py-3">Code</th>
            <th className="text-left px-5 py-3">Description</th>
            <th className="text-right px-5 py-3">Debit</th>
            <th className="text-right px-5 py-3">Credit</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink/5">
          {rows.length === 0 ? (
            <tr><td colSpan={4} className="px-5 py-8 text-center text-ink/40">No accounts found.</td></tr>
          ) : (
            rows.map((r) => (
              <tr key={r.account._id}>
                <td className="px-5 py-3 font-medium text-ink">{r.account.code}</td>
                <td className="px-5 py-3 text-ink/80">{r.account.description}</td>
                <td className="px-5 py-3 text-right text-ink/70">{r.debit ? r.debit.toFixed(2) : "—"}</td>
                <td className="px-5 py-3 text-right text-ink/70">{r.credit ? r.credit.toFixed(2) : "—"}</td>
              </tr>
            ))
          )}
        </tbody>
        <tfoot className="bg-ink/[0.03] font-semibold">
          <tr>
            <td className="px-5 py-3" colSpan={2}>Total</td>
            <td className="px-5 py-3 text-right">{totalDebit.toFixed(2)}</td>
            <td className="px-5 py-3 text-right">{totalCredit.toFixed(2)}</td>
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
