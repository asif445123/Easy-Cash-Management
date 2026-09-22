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
  label: string;
  voucherRef: string;
  narration: string;
  debit: number;
  credit: number;
  balance: number;
}
interface Ledger {
  account: Account;
  opening: number;
  rows: Row[];
  closing: number;
}

// Format a Date using LOCAL year/month/day (avoids the UTC shift that
// `toISOString().slice(0, 10)` introduces for timezones ahead of UTC — e.g.
// local midnight on the 1st of the month becomes the last day of the
// previous month once converted to UTC).
function toLocalDateStr(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function today() {
  return toLocalDateStr(new Date());
}
function firstOfMonth() {
  const d = new Date();
  return toLocalDateStr(new Date(d.getFullYear(), d.getMonth(), 1));
}

export default function AccountLedgerReportPage() {
  const [accountTypes, setAccountTypes] = useState<AccountType[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [type, setType] = useState("");
  const [accountCode, setAccountCode] = useState("");
  const [toCode, setToCode] = useState("");
  const [description, setDescription] = useState("");
  const [from, setFrom] = useState(firstOfMonth());
  const [to, setTo] = useState(today());
  const [ledgers, setLedgers] = useState<Ledger[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/admin/account-types", { cache: "no-store" }).then((r) => r.json()).then((d) => setAccountTypes(d.accountTypes || []));
    fetch("/api/admin/accounts", { cache: "no-store" }).then((r) => r.json()).then((d) => setAccounts(d.accounts || []));
  }, []);

  useEffect(() => {
    const acc = accounts.find((a) => a.code === accountCode);
    setDescription(acc?.description || "");
  }, [accountCode, accounts]);

  async function loadReport(e?: React.FormEvent) {
    e?.preventDefault();
    setLoading(true);
    try {
      const params = new URLSearchParams({ from, to });
      if (type) params.set("type", type);
      if (accountCode) params.set("accountCode", accountCode);
      if (toCode) params.set("toCode", toCode);
      const res = await fetch(`/api/admin/reports/account-ledger?${params}`, { cache: "no-store" });
      const data = await res.json();
      setLedgers(data.ledgers || []);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-paper">
      <AdminHeader />

      <div className="max-w-6xl mx-auto px-6 pb-16">
        <h1 className="font-display text-2xl font-bold text-ink mb-6">Account Ledger</h1>

        <form onSubmit={loadReport} className="bg-white rounded-2xl border border-ink/10 p-6 mb-6 space-y-4">
          <Field label="Account Type">
            <select value={type} onChange={(e) => setType(e.target.value)} className="input">
              <option value="">All types</option>
              {accountTypes.map((t) => (
                <option key={t._id} value={t.type}>{t.type}</option>
              ))}
            </select>
          </Field>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Account Code">
              <select value={accountCode} onChange={(e) => setAccountCode(e.target.value)} className="input">
                <option value="">All accounts (in type)</option>
                {accounts.map((a) => (
                  <option key={a._id} value={a.code}>{a.code} — {a.description}</option>
                ))}
              </select>
            </Field>
            <Field label="To Code">
              <select value={toCode} onChange={(e) => setToCode(e.target.value)} className="input" disabled={!accountCode}>
                <option value="">Same as Account Code</option>
                {accounts.map((a) => (
                  <option key={a._id} value={a.code}>{a.code} — {a.description}</option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Description">
            <input value={description} readOnly className="input bg-ink/5 text-ink/60" />
          </Field>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="From">
              <input type="date" required value={from} onChange={(e) => setFrom(e.target.value)} className="input" />
            </Field>
            <Field label="To">
              <input type="date" required value={to} onChange={(e) => setTo(e.target.value)} className="input" />
            </Field>
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

        {!loading && ledgers.length === 0 && (
          <p className="text-ink/40 text-sm">Set filters above and click Preview.</p>
        )}

        <div className="space-y-6">
          {ledgers.map((l) => (
            <div key={l.account._id} className="bg-white rounded-2xl border border-ink/10 overflow-x-auto">
              <div className="px-5 py-3 border-b border-ink/5 flex items-center justify-between flex-wrap gap-2">
                <p className="font-semibold text-ink">{l.account.code} — {l.account.description}</p>
                <div className="flex gap-6 text-sm">
                  <span className="text-ink/50">Opening: <span className="font-semibold text-ink">{l.opening.toFixed(2)}</span></span>
                  <span className="text-ink/50">Closing: <span className="font-semibold text-ink">{l.closing.toFixed(2)}</span></span>
                </div>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-ink/[0.03] text-ink/50 text-xs uppercase tracking-wide">
                  <tr>
                    <th className="text-left px-5 py-3">Date</th>
                    <th className="text-left px-5 py-3">Ref / Narration</th>
                    <th className="text-right px-5 py-3">Debit</th>
                    <th className="text-right px-5 py-3">Credit</th>
                    <th className="text-right px-5 py-3">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/5">
                  {l.rows.length === 0 ? (
                    <tr><td colSpan={5} className="px-5 py-6 text-center text-ink/40">No entries in this period.</td></tr>
                  ) : (
                    [...l.rows].reverse().map((r, i) => (
                      <tr key={i}>
                        <td className="px-5 py-3 text-ink/80">{r.label}</td>
                        <td className="px-5 py-3 text-ink/60">{r.voucherRef} {r.narration ? `— ${r.narration}` : ""}</td>
                        <td className="px-5 py-3 text-right text-ink/70">{r.debit.toFixed(2)}</td>
                        <td className="px-5 py-3 text-right text-ink/70">{r.credit.toFixed(2)}</td>
                        <td className="px-5 py-3 text-right font-medium text-ink">{r.balance.toFixed(2)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </div>

      <style jsx global>{`
        .input { width: 100%; border: 1px solid rgba(0,0,0,0.12); border-radius: 0.5rem; padding: 0.5rem 0.75rem; font-size: 0.875rem; }
        .input:focus { outline: none; box-shadow: 0 0 0 2px rgba(14,124,74,0.25); }
      `}</style>
    </main>
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
