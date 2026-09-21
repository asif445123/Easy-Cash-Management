"use client";

import { useEffect, useState } from "react";
import AdminHeader from "@/components/AdminHeader";

interface AccountType {
  _id: string;
  type: string;
}

interface Account {
  _id: string;
  type: string;
  code: string;
  description: string;
  openingDebit: number;
  openingCredit: number;
}

export default function AccountsListReportPage() {
  const [accountTypes, setAccountTypes] = useState<AccountType[]>([]);
  const [type, setType] = useState("");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/account-types", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setAccountTypes(d.accountTypes || []));
  }, []);

  async function loadReport(e?: React.FormEvent) {
    e?.preventDefault();
    setLoading(true);
    try {
      const qs = type ? `?type=${encodeURIComponent(type)}` : "";
      const res = await fetch(`/api/admin/reports/accounts-list${qs}`, { cache: "no-store" });
      const data = await res.json();
      setAccounts(data.accounts || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="min-h-screen bg-paper">
      <AdminHeader />

      <div className="max-w-4xl mx-auto px-6 pb-16">
        <h1 className="font-display text-2xl font-bold text-ink mb-6">Accounts List</h1>

        <form onSubmit={loadReport} className="bg-white rounded-2xl border border-ink/10 p-6 mb-6 flex items-end gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-ink/80 mb-1">Type</label>
            <select value={type} onChange={(e) => setType(e.target.value)} className="input">
              <option value="">All types</option>
              {accountTypes.map((t) => (
                <option key={t._id} value={t.type}>
                  {t.type}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="px-5 py-2.5 rounded-lg bg-primary text-white font-semibold hover:bg-primary-dark transition-colors">
            Preview
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="px-5 py-2.5 rounded-lg border border-ink/15 text-ink font-semibold hover:bg-ink/5 transition-colors"
          >
            Print
          </button>
        </form>

        <div className="bg-white rounded-2xl border border-ink/10 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-ink/[0.03] text-ink/50 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-5 py-3">Code</th>
                <th className="text-left px-5 py-3">Description</th>
                <th className="text-left px-5 py-3">Type</th>
                <th className="text-right px-5 py-3">Op. Debit</th>
                <th className="text-right px-5 py-3">Op. Credit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-ink/40">Loading…</td>
                </tr>
              ) : accounts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-ink/40">No accounts found.</td>
                </tr>
              ) : (
                accounts.map((a) => (
                  <tr key={a._id}>
                    <td className="px-5 py-3 font-medium text-ink">{a.code}</td>
                    <td className="px-5 py-3 text-ink/80">{a.description}</td>
                    <td className="px-5 py-3 text-ink/60">{a.type}</td>
                    <td className="px-5 py-3 text-right text-ink/70">{a.openingDebit.toFixed(2)}</td>
                    <td className="px-5 py-3 text-right text-ink/70">{a.openingCredit.toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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
