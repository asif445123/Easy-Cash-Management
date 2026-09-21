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
  openingDebit: number;
  openingCredit: number;
  txnDebit: number;
  txnCredit: number;
  closingDebit: number;
  closingCredit: number;
}
interface Totals {
  openingDebit: number;
  openingCredit: number;
  txnDebit: number;
  txnCredit: number;
  closingDebit: number;
  closingCredit: number;
}
interface Period {
  rows: Row[];
  totals: Totals;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}
function firstOfMonth() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
}

export default function TrialBalance6ColPage() {
  const [accountTypes, setAccountTypes] = useState<AccountType[]>([]);
  const [type, setType] = useState("");
  const [from, setFrom] = useState(firstOfMonth());
  const [to, setTo] = useState(today());
  const [compare, setCompare] = useState(false);
  const [compareFrom, setCompareFrom] = useState("");
  const [compareTo, setCompareTo] = useState("");
  const [current, setCurrent] = useState<Period | null>(null);
  const [comparison, setComparison] = useState<Period | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/admin/account-types", { cache: "no-store" }).then((r) => r.json()).then((d) => setAccountTypes(d.accountTypes || []));
  }, []);

  async function loadReport(e?: React.FormEvent) {
    e?.preventDefault();
    setLoading(true);
    try {
      const params = new URLSearchParams({ from, to });
      if (type) params.set("type", type);
      if (compare && compareFrom && compareTo) {
        params.set("compare", "true");
        params.set("compareFrom", compareFrom);
        params.set("compareTo", compareTo);
      }
      const res = await fetch(`/api/admin/reports/trial-balance-6col?${params}`, { cache: "no-store" });
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

      <div className="max-w-5xl mx-auto px-6 pb-16">
        <h1 className="font-display text-2xl font-bold text-ink mb-6">Trial Balance (6 Column)</h1>

        <form onSubmit={loadReport} className="bg-white rounded-2xl border border-ink/10 p-6 mb-6 space-y-4">
          <Field label="Type">
            <select value={type} onChange={(e) => setType(e.target.value)} className="input max-w-xs">
              <option value="">All types</option>
              {accountTypes.map((t) => (
                <option key={t._id} value={t.type}>{t.type}</option>
              ))}
            </select>
          </Field>

          <div className="grid sm:grid-cols-2 gap-4 max-w-md">
            <Field label="From">
              <input type="date" required value={from} onChange={(e) => setFrom(e.target.value)} className="input" />
            </Field>
            <Field label="To">
              <input type="date" required value={to} onChange={(e) => setTo(e.target.value)} className="input" />
            </Field>
          </div>

          <label className="flex items-center gap-2 text-sm text-ink/70 cursor-pointer select-none">
            <input type="checkbox" checked={compare} onChange={(e) => setCompare(e.target.checked)} className="rounded border-ink/30 text-primary" />
            Compare with another period
          </label>

          {compare && (
            <div className="grid sm:grid-cols-2 gap-4 max-w-md bg-ink/[0.03] rounded-lg p-4">
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
          <div className="space-y-6">
            <PeriodTable title={comparison ? `${from} to ${to}` : undefined} period={current} />
            {comparison && <PeriodTable title={`${compareFrom} to ${compareTo}`} period={comparison} />}
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

function PeriodTable({ title, period }: { title?: string; period: Period }) {
  return (
    <div className="bg-white rounded-2xl border border-ink/10 overflow-x-auto">
      {title && <p className="px-5 pt-4 text-sm font-semibold text-ink/70">{title}</p>}
      <table className="w-full text-sm">
        <thead className="bg-ink/[0.03] text-ink/50 text-xs uppercase tracking-wide">
          <tr>
            <th rowSpan={2} className="text-left px-5 py-3 align-bottom">Code</th>
            <th rowSpan={2} className="text-left px-5 py-3 align-bottom">Description</th>
            <th colSpan={2} className="text-center px-3 py-1 border-l border-ink/10">Opening</th>
            <th colSpan={2} className="text-center px-3 py-1 border-l border-ink/10">Transaction</th>
            <th colSpan={2} className="text-center px-3 py-1 border-l border-ink/10">Closing</th>
          </tr>
          <tr>
            <th className="text-right px-3 py-2 border-l border-ink/10">Debit</th>
            <th className="text-right px-3 py-2">Credit</th>
            <th className="text-right px-3 py-2 border-l border-ink/10">Debit</th>
            <th className="text-right px-3 py-2">Credit</th>
            <th className="text-right px-3 py-2 border-l border-ink/10">Debit</th>
            <th className="text-right px-3 py-2">Credit</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink/5">
          {period.rows.length === 0 ? (
            <tr><td colSpan={8} className="px-5 py-8 text-center text-ink/40">No accounts found.</td></tr>
          ) : (
            period.rows.map((r) => (
              <tr key={r.account._id}>
                <td className="px-5 py-2 font-medium text-ink">{r.account.code}</td>
                <td className="px-5 py-2 text-ink/80">{r.account.description}</td>
                <td className="px-3 py-2 text-right text-ink/70 border-l border-ink/5">{r.openingDebit ? r.openingDebit.toFixed(2) : "—"}</td>
                <td className="px-3 py-2 text-right text-ink/70">{r.openingCredit ? r.openingCredit.toFixed(2) : "—"}</td>
                <td className="px-3 py-2 text-right text-ink/70 border-l border-ink/5">{r.txnDebit ? r.txnDebit.toFixed(2) : "—"}</td>
                <td className="px-3 py-2 text-right text-ink/70">{r.txnCredit ? r.txnCredit.toFixed(2) : "—"}</td>
                <td className="px-3 py-2 text-right font-medium text-ink border-l border-ink/5">{r.closingDebit ? r.closingDebit.toFixed(2) : "—"}</td>
                <td className="px-3 py-2 text-right font-medium text-ink">{r.closingCredit ? r.closingCredit.toFixed(2) : "—"}</td>
              </tr>
            ))
          )}
        </tbody>
        <tfoot className="bg-ink/[0.03] font-semibold">
          <tr>
            <td className="px-5 py-3" colSpan={2}>Total</td>
            <td className="px-3 py-3 text-right border-l border-ink/10">{period.totals.openingDebit.toFixed(2)}</td>
            <td className="px-3 py-3 text-right">{period.totals.openingCredit.toFixed(2)}</td>
            <td className="px-3 py-3 text-right border-l border-ink/10">{period.totals.txnDebit.toFixed(2)}</td>
            <td className="px-3 py-3 text-right">{period.totals.txnCredit.toFixed(2)}</td>
            <td className="px-3 py-3 text-right border-l border-ink/10">{period.totals.closingDebit.toFixed(2)}</td>
            <td className="px-3 py-3 text-right">{period.totals.closingCredit.toFixed(2)}</td>
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
