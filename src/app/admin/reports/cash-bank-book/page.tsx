"use client";

import { useEffect, useState } from "react";
import AdminHeader from "@/components/AdminHeader";

interface Account {
  _id: string;
  code: string;
  description: string;
}
interface Row {
  label: string;
  voucherRef?: string;
  narration?: string;
  debit: number;
  credit: number;
  balance: number;
}
interface Period {
  rows: Row[];
  opening: number;
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

export default function CashBankBookReportPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountCode, setAccountCode] = useState("");
  const [description, setDescription] = useState("");
  const [from, setFrom] = useState(firstOfMonth());
  const [to, setTo] = useState(today());
  const [groupBy, setGroupBy] = useState<"date" | "month">("date");
  const [compare, setCompare] = useState(false);
  const [compareFrom, setCompareFrom] = useState("");
  const [compareTo, setCompareTo] = useState("");
  const [current, setCurrent] = useState<Period | null>(null);
  const [comparison, setComparison] = useState<Period | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/admin/accounts", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setAccounts(d.accounts || []));
  }, []);

  useEffect(() => {
    const acc = accounts.find((a) => a.code === accountCode);
    setDescription(acc?.description || "");
  }, [accountCode, accounts]);

  async function loadReport(e?: React.FormEvent) {
    e?.preventDefault();
    if (!accountCode) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ accountCode, from, to, groupBy });
      if (compare && compareFrom && compareTo) {
        params.set("compare", "true");
        params.set("compareFrom", compareFrom);
        params.set("compareTo", compareTo);
      }
      const res = await fetch(`/api/admin/reports/cash-bank-book?${params}`, { cache: "no-store" });
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
        <h1 className="font-display text-2xl font-bold text-ink mb-6">Cash / Bank Book</h1>

        <form onSubmit={loadReport} className="bg-white rounded-2xl border border-ink/10 p-6 mb-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Account code">
              <select required value={accountCode} onChange={(e) => setAccountCode(e.target.value)} className="input">
                <option value="">Select account…</option>
                {accounts.map((a) => (
                  <option key={a._id} value={a.code}>{a.code} — {a.description}</option>
                ))}
              </select>
            </Field>
            <Field label="Description">
              <input value={description} readOnly className="input bg-ink/5 text-ink/60" />
            </Field>
          </div>

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
      <button type="button" onClick={() => setGroupBy("date")} className={`px-3 py-1.5 ${groupBy === "date" ? "bg-primary text-white" : "text-ink/70 hover:bg-ink/5"}`}>Date wise</button>
      <button type="button" onClick={() => setGroupBy("month")} className={`px-3 py-1.5 ${groupBy === "month" ? "bg-primary text-white" : "text-ink/70 hover:bg-ink/5"}`}>Month wise</button>
    </div>
  );
}

function PeriodTable({ title, period, groupBy }: { title?: string; period: Period; groupBy: "date" | "month" }) {
  return (
    <div className="bg-white rounded-2xl border border-ink/10 overflow-x-auto">
      {title && <p className="px-5 pt-4 text-sm font-semibold text-ink/70">{title}</p>}
      <div className="px-5 py-3 flex gap-6 text-sm border-b border-ink/5">
        <span className="text-ink/50">Opening: <span className="font-semibold text-ink">{period.opening.toFixed(2)}</span></span>
        <span className="text-ink/50">Closing: <span className="font-semibold text-ink">{period.closing.toFixed(2)}</span></span>
      </div>
      <table className="w-full text-sm">
        <thead className="bg-ink/[0.03] text-ink/50 text-xs uppercase tracking-wide">
          <tr>
            <th className="text-left px-5 py-3">{groupBy === "date" ? "Date" : "Month"}</th>
            {groupBy === "date" && <th className="text-left px-5 py-3">Ref / Narration</th>}
            <th className="text-right px-5 py-3">Debit</th>
            <th className="text-right px-5 py-3">Credit</th>
            <th className="text-right px-5 py-3">Balance</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink/5">
          {period.rows.length === 0 ? (
            <tr><td colSpan={5} className="px-5 py-8 text-center text-ink/40">No entries in this period.</td></tr>
          ) : (
            period.rows.map((r, i) => (
              <tr key={i}>
                <td className="px-5 py-3 text-ink/80">{r.label}</td>
                {groupBy === "date" && (
                  <td className="px-5 py-3 text-ink/60">
                    {r.voucherRef} {r.narration ? `— ${r.narration}` : ""}
                  </td>
                )}
                <td className="px-5 py-3 text-right text-ink/70">{r.debit.toFixed(2)}</td>
                <td className="px-5 py-3 text-right text-ink/70">{r.credit.toFixed(2)}</td>
                <td className="px-5 py-3 text-right font-medium text-ink">{r.balance.toFixed(2)}</td>
              </tr>
            ))
          )}
        </tbody>
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
