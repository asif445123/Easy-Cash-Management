"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import AdminHeader from "@/components/AdminHeader";
import AccountPicker from "@/components/AccountPicker";
import { safeJson } from "@/lib/api-client";

interface Account {
  _id: string;
  code: string;
  description: string;
  type?: string;
}

// Standard PKR note/coin denominations, matching the physical cash-count
// sheet in the screenshot. Notes and coins are grouped with a small label
// since that's how the paper version separates them.
const NOTE_DENOMINATIONS = [5000, 1000, 500, 100, 50, 20, 10];
const COIN_DENOMINATIONS = [5, 2, 1];

// Far enough back to capture an account's full history when asking the
// ledger report for a running balance — see the balance-fetch effect below.
const LEDGER_EPOCH = "2000-01-01";

interface TellyEntry {
  _id: string;
  date: string;
  accountCode: string;
  grandTotal: number;
  systemBalance: number;
  difference: number;
}

function toLocalDateStr(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function TellyCashPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountCode, setAccountCode] = useState("");
  const [date, setDate] = useState(() => toLocalDateStr(new Date()));
  const [qty, setQty] = useState<Record<number, string>>({});
  const [systemBalance, setSystemBalance] = useState<number | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState<TellyEntry[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // When set, the form is editing an existing count instead of creating one.
  const [editingId, setEditingId] = useState<string | null>(null);
  // Bumped after any create/update/delete so the history table refetches.
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetch("/api/admin/accounts", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        const cashAccounts = (d.accounts || []).filter(
          (a: Account) => !a.type || a.type === "Cash"
        );
        setAccounts(cashAccounts.length ? cashAccounts : d.accounts || []);
        // Default to the first Cash-type account if there's exactly one,
        // so the common case (a single "Cash in Hand") needs no picking.
        if (cashAccounts.length === 1) setAccountCode(cashAccounts[0].code);
      });
  }, []);

  // Reuses the existing Account Ledger report endpoint to get this account's
  // current running balance (opening balance + every Cash Book and Journal
  // Voucher entry against it, up to today) rather than duplicating that
  // calculation here.
  useEffect(() => {
    if (!accountCode) {
      setSystemBalance(null);
      return;
    }
    setLoadingBalance(true);
    const today = toLocalDateStr(new Date());
    fetch(`/api/admin/reports/account-ledger?accountCode=${encodeURIComponent(accountCode)}&from=${LEDGER_EPOCH}&to=${today}`, {
      cache: "no-store",
    })
      .then((r) => r.json())
      .then((d) => {
        const ledger = d.ledgers?.[0];
        setSystemBalance(typeof ledger?.closing === "number" ? ledger.closing : null);
      })
      .catch(() => setSystemBalance(null))
      .finally(() => setLoadingBalance(false));
  }, [accountCode]);

  useEffect(() => {
    if (!accountCode) {
      setHistory([]);
      return;
    }
    setLoadingHistory(true);
    fetch(`/api/admin/telly-cash?accountCode=${encodeURIComponent(accountCode)}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setHistory(d.entries || []))
      .catch(() => setHistory([]))
      .finally(() => setLoadingHistory(false));
  }, [accountCode, refreshKey]);

  function updateQty(denom: number, value: string) {
    setQty((q) => ({ ...q, [denom]: value }));
  }

  function amountFor(denom: number): number {
    return (Number(qty[denom]) || 0) * denom;
  }

  const grandTotal = [...NOTE_DENOMINATIONS, ...COIN_DENOMINATIONS].reduce(
    (sum, d) => sum + amountFor(d),
    0
  );

  const difference = systemBalance !== null ? grandTotal - systemBalance : null;
  const matched = difference !== null && Math.abs(difference) < 0.01;

  function resetForm() {
    setEditingId(null);
    setQty({});
  }

  // Loads an existing count back into the form so it can be corrected and
  // re-saved. The stored systemBalance is shown as-is (rather than today's)
  // so the difference you see is the one that was originally recorded.
  async function handleEdit(entry: TellyEntry) {
    try {
      const res = await fetch(`/api/admin/telly-cash?id=${encodeURIComponent(entry._id)}`, {
        cache: "no-store",
      });
      const data = await safeJson(res);
      if (!res.ok || !data.entry) {
        Swal.fire({ icon: "error", title: "Could not load that count", text: data.message });
        return;
      }
      const e = data.entry;
      const nextQty: Record<number, string> = {};
      for (const [k, v] of Object.entries(e.denominations || {})) {
        nextQty[Number(k)] = String(v);
      }
      setAccountCode(e.accountCode);
      setDate(String(e.date).slice(0, 10));
      setQty(nextQty);
      setSystemBalance(typeof e.systemBalance === "number" ? e.systemBalance : null);
      setEditingId(e._id);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      Swal.fire({ icon: "error", title: "Could not load that count" });
    }
  }

  async function handleDelete(entry: TellyEntry) {
    const confirm = await Swal.fire({
      icon: "warning",
      title: "Delete this telly count?",
      html: `Counted on <b>${new Date(entry.date).toLocaleDateString()}</b>.<br/>This cannot be undone.`,
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#b91c1c",
      cancelButtonText: "Cancel",
    });
    if (!confirm.isConfirmed) return;

    try {
      const res = await fetch(`/api/admin/telly-cash?id=${encodeURIComponent(entry._id)}`, {
        method: "DELETE",
      });
      const data = await safeJson(res);
      if (!res.ok) {
        Swal.fire({ icon: "error", title: "Could not delete", text: data.message });
        return;
      }
      // If the entry being deleted is the one currently open in the form,
      // clear the form so we don't leave a stale edit in progress.
      if (editingId === entry._id) resetForm();
      Swal.fire({ icon: "success", title: "Deleted", timer: 1200, showConfirmButton: false });
      setRefreshKey((k) => k + 1);
    } catch {
      Swal.fire({ icon: "error", title: "Could not delete that count" });
    }
  }

  async function handleSave() {
    if (!accountCode) {
      Swal.fire({ icon: "warning", title: "Select a cash account first" });
      return;
    }
    if (systemBalance === null) {
      Swal.fire({ icon: "warning", title: "Still loading the system balance — try again in a moment" });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/telly-cash", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          _id: editingId ?? undefined,
          accountCode,
          date,
          denominations: Object.fromEntries(
            [...NOTE_DENOMINATIONS, ...COIN_DENOMINATIONS].map((d) => [d, Number(qty[d]) || 0])
          ),
          grandTotal,
          systemBalance,
          difference,
        }),
      });
      const data = await safeJson(res);
      if (!res.ok) {
        Swal.fire({ icon: "error", title: "Could not save", text: data.message });
        return;
      }
      Swal.fire({
        icon: matched ? "success" : "warning",
        title: matched
          ? editingId
            ? "Cash matches — telly updated"
            : "Cash matches — telly saved"
          : `Difference of Rs ${Math.abs(difference!).toLocaleString()} ${editingId ? "updated" : "recorded"}`,
        timer: 1400,
        showConfirmButton: false,
      });
      resetForm();
      setRefreshKey((k) => k + 1);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-paper">
      <AdminHeader />

      <div className="max-w-3xl mx-auto px-6 pb-16">
        <h1 className="font-display text-2xl font-bold text-ink mb-1">Telly Cash</h1>
        <p className="text-sm text-ink/50 mb-6">
          Count the physical notes and coins on hand, then compare against what the system says this
          account's balance should be.
        </p>

        <div className="bg-white rounded-2xl border border-ink/10 p-6 mb-6">
          {editingId && (
            <div className="mb-4 flex items-center justify-between gap-3 rounded-lg bg-amber-50 border border-amber-200 px-4 py-2.5 text-sm text-amber-800">
              <span>Editing an existing telly count — saving will overwrite it.</span>
              <button
                onClick={resetForm}
                className="shrink-0 text-xs font-semibold underline hover:no-underline"
              >
                Cancel edit
              </button>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4 mb-5">
            <Field label="Account">
              <AccountPicker
                required
                accounts={accounts}
                value={accountCode}
                onChange={(code) => {
                  // Switching accounts abandons any in-progress edit.
                  resetForm();
                  setAccountCode(code);
                }}
                placeholder="Search cash account…"
              />
            </Field>
            <Field label="Date">
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input" />
            </Field>
          </div>

          <div className="border border-ink/10 rounded-lg overflow-hidden mb-2">
            <table className="w-full text-sm">
              <thead className="bg-ink/[0.03] text-ink/50 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-4 py-2">Denomination</th>
                  <th className="text-right px-4 py-2 w-28">Qty</th>
                  <th className="text-right px-4 py-2 w-32">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                <tr className="bg-ink/[0.02]">
                  <td colSpan={3} className="px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink/40">
                    Notes
                  </td>
                </tr>
                {NOTE_DENOMINATIONS.map((d) => (
                  <DenomRow key={d} denom={d} qty={qty[d] || ""} amount={amountFor(d)} onChange={updateQty} />
                ))}
                <tr className="bg-ink/[0.02]">
                  <td colSpan={3} className="px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink/40">
                    Coins
                  </td>
                </tr>
                {COIN_DENOMINATIONS.map((d) => (
                  <DenomRow key={d} denom={d} qty={qty[d] || ""} amount={amountFor(d)} onChange={updateQty} />
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-primary/5 font-semibold">
                  <td className="px-4 py-3" colSpan={2}>
                    Grand Total
                  </td>
                  <td className="px-4 py-3 text-right text-ink">Rs {grandTotal.toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="grid grid-cols-3 gap-4 text-sm bg-ink/[0.03] rounded-lg p-4 mb-5">
            <div>
              <p className="text-xs text-ink/50 uppercase tracking-wide mb-1">Counted</p>
              <p className="font-semibold text-ink">Rs {grandTotal.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-ink/50 uppercase tracking-wide mb-1">System balance</p>
              <p className="font-semibold text-ink">
                {loadingBalance ? "…" : systemBalance !== null ? `Rs ${systemBalance.toLocaleString()}` : "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-ink/50 uppercase tracking-wide mb-1">Difference</p>
              {difference === null ? (
                <p className="font-semibold text-ink/40">—</p>
              ) : matched ? (
                <p className="font-semibold text-primary">Matched ✓</p>
              ) : (
                <p className="font-semibold text-danger">
                  {difference > 0 ? "Excess" : "Short"} Rs {Math.abs(difference).toLocaleString()}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2.5 rounded-lg bg-primary text-white font-semibold hover:bg-primary-dark transition-colors disabled:opacity-60"
            >
              {saving ? "Saving…" : editingId ? "Update telly" : "Save telly"}
            </button>
            {editingId && (
              <button
                onClick={resetForm}
                disabled={saving}
                className="px-5 py-2.5 rounded-lg border border-ink/15 text-ink/70 font-semibold hover:bg-ink/[0.04] transition-colors disabled:opacity-60"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {accountCode && (
          <div className="bg-white rounded-2xl border border-ink/10 overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead className="bg-ink/[0.03] text-ink/50 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-5 py-3">Date</th>
                  <th className="text-right px-5 py-3">Counted</th>
                  <th className="text-right px-5 py-3">System balance</th>
                  <th className="text-right px-5 py-3">Difference</th>
                  <th className="text-center px-5 py-3 w-28">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                {loadingHistory ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-ink/40">
                      Loading…
                    </td>
                  </tr>
                ) : history.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-ink/40">
                      No telly counts recorded yet for this account.
                    </td>
                  </tr>
                ) : (
                  history.map((h) => (
                    <tr key={h._id} className={editingId === h._id ? "bg-amber-50/60" : undefined}>
                      <td className="px-5 py-3 text-ink/70">{new Date(h.date).toLocaleDateString()}</td>
                      <td className="px-5 py-3 text-right text-ink/70">Rs {h.grandTotal.toLocaleString()}</td>
                      <td className="px-5 py-3 text-right text-ink/70">Rs {h.systemBalance.toLocaleString()}</td>
                      <td className={`px-5 py-3 text-right font-medium ${Math.abs(h.difference) < 0.01 ? "text-primary" : "text-danger"}`}>
                        {Math.abs(h.difference) < 0.01 ? "Matched" : `${h.difference > 0 ? "+" : ""}Rs ${h.difference.toLocaleString()}`}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(h)}
                            title="Edit this count"
                            aria-label="Edit this count"
                            className="w-9 h-9 rounded-full border border-emerald-300 text-emerald-600 grid place-items-center hover:bg-emerald-50 transition-colors"
                          >
                            <PencilIcon />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(h)}
                            title="Delete this count"
                            aria-label="Delete this count"
                            className="w-9 h-9 rounded-full border border-red-300 text-red-600 grid place-items-center hover:bg-red-50 transition-colors"
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
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

function PencilIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4"
    >
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}

function DenomRow({
  denom,
  qty,
  amount,
  onChange,
}: {
  denom: number;
  qty: string;
  amount: number;
  onChange: (denom: number, value: string) => void;
}) {
  return (
    <tr>
      <td className="px-4 py-2 text-ink/80">Rs {denom.toLocaleString()}</td>
      <td className="px-4 py-2">
        <input
          type="number"
          min="0"
          step="1"
          value={qty}
          onChange={(e) => onChange(denom, e.target.value)}
          className="input text-right"
        />
      </td>
      <td className="px-4 py-2 text-right text-ink/70">{amount > 0 ? amount.toLocaleString() : "—"}</td>
    </tr>
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