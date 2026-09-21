"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { FaPen, FaTrash } from "react-icons/fa";
import { safeJson } from "@/lib/api-client";
import AdminHeader from "@/components/AdminHeader";

interface AccountType {
  _id: string;
  serial: number;
  type: string;
  showInReceivablePayableList: boolean;
  isIncomeType: boolean;
  isExpenseType: boolean;
  isCashBankType: boolean;
  isMotorcycleType: boolean;
  isMobileType: boolean;
  isTuningType: boolean;
}

export default function AccountTypesPage() {
  const [accountTypes, setAccountTypes] = useState<AccountType[]>([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState("");
  const [showInList, setShowInList] = useState(false);
  const [isIncomeType, setIsIncomeType] = useState(false);
  const [isExpenseType, setIsExpenseType] = useState(false);
  const [isCashBankType, setIsCashBankType] = useState(false);
  const [isMotorcycleType, setIsMotorcycleType] = useState(false);
  const [isMobileType, setIsMobileType] = useState(false);
  const [isTuningType, setIsTuningType] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Auto-preview of the Serial # this new account type will get — matches
  // the read-only "Serial #" field on the original screen.
  const nextSerial =
    accountTypes.length === 0 ? 1 : Math.max(...accountTypes.map((t) => t.serial)) + 1;

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/account-types", { cache: "no-store" });
      const data = await safeJson(res);
      setAccountTypes(data.accountTypes || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function startEdit(t: AccountType) {
    setEditingId(t._id);
    setType(t.type);
    setShowInList(t.showInReceivablePayableList);
    setIsIncomeType(!!t.isIncomeType);
    setIsExpenseType(!!t.isExpenseType);
    setIsCashBankType(!!t.isCashBankType);
    setIsMotorcycleType(!!t.isMotorcycleType);
    setIsMobileType(!!t.isMobileType);
    setIsTuningType(!!t.isTuningType);
  }

  function cancelEdit() {
    setEditingId(null);
    setType("");
    setShowInList(false);
    setIsIncomeType(false);
    setIsExpenseType(false);
    setIsCashBankType(false);
    setIsMotorcycleType(false);
    setIsMobileType(false);
    setIsTuningType(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingId ? `/api/admin/account-types/${editingId}` : "/api/admin/account-types";
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          showInReceivablePayableList: showInList,
          isIncomeType,
          isExpenseType,
          isCashBankType,
          isMotorcycleType,
          isMobileType,
          isTuningType,
        }),
      });
      const data = await safeJson(res);

      if (!res.ok) {
        Swal.fire({ icon: "error", title: "Could not save", text: data.message });
        return;
      }

      Swal.fire({
        icon: "success",
        title: editingId ? "Account type updated" : "Account type saved",
        timer: 1000,
        showConfirmButton: false,
      });
      cancelEdit();
      load();
    } finally {
      setSaving(false);
    }
  }

  async function deleteType(id: string) {
    const result = await Swal.fire({
      icon: "warning",
      title: "Delete this account type?",
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#B3452C",
    });
    if (!result.isConfirmed) return;

    const res = await fetch(`/api/admin/account-types/${id}`, { method: "DELETE" });
    if (res.ok) {
      if (editingId === id) cancelEdit();
      load();
    } else {
      Swal.fire({ icon: "error", title: "Failed to delete" });
    }
  }

  return (
    <main className="min-h-screen bg-paper">
      <AdminHeader />

      <div className="max-w-3xl mx-auto px-6 pb-16">
        <h1 className="font-display text-2xl font-bold text-ink mb-6">Account Types</h1>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-ink/10 p-6 mb-8 space-y-4 max-w-sm"
        >
          {editingId && (
            <div className="text-xs font-medium text-primary bg-primary/10 rounded-lg px-3 py-2">
              Editing existing account type
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-ink/80 mb-1">Serial #</label>
            <input
              disabled
              value={editingId ? accountTypes.find((t) => t._id === editingId)?.serial ?? "" : nextSerial}
              className="input bg-ink/5 text-ink/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink/80 mb-1">Type</label>
            <input
              required
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="input"
              placeholder="e.g. Bank, Customer, Supplier"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-ink/70 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showInList}
              onChange={(e) => setShowInList(e.target.checked)}
              className="rounded border-ink/30 text-primary focus:ring-primary/40"
            />
            Show in Receivable / Payable List
          </label>
          <label className="flex items-center gap-2 text-sm text-ink/70 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isCashBankType}
              onChange={(e) => setIsCashBankType(e.target.checked)}
              className="rounded border-ink/30 text-primary focus:ring-primary/40"
            />
            This is a Cash / Bank account type
          </label>
          <p className="text-xs text-ink/40 -mt-1">
            Check this for types like "Cash" or "Bank" — it's how the Dashboard finds your
            cash/bank accounts to show their balance, regardless of whether you record
            transactions via Cash Book or Journal Voucher.
          </p>
          <label className="flex items-center gap-2 text-sm text-ink/70 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isIncomeType}
              onChange={(e) => setIsIncomeType(e.target.checked)}
              className="rounded border-ink/30 text-primary focus:ring-primary/40"
            />
            Counts as Income on Dashboard
          </label>
          <label className="flex items-center gap-2 text-sm text-ink/70 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isExpenseType}
              onChange={(e) => setIsExpenseType(e.target.checked)}
              className="rounded border-ink/30 text-primary focus:ring-primary/40"
            />
            Counts as Expense on Dashboard
          </label>
          <p className="text-xs text-ink/40 -mt-1">
            Only accounts of a type checked here add to the Income/Expense totals on your
            Dashboard. Leave unchecked for money you're just holding or fronting for someone
            else (use Accounts Receivable/Payable for that instead).
          </p>
          <label className="flex items-center gap-2 text-sm text-ink/70 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isMotorcycleType}
              onChange={(e) => setIsMotorcycleType(e.target.checked)}
              className="rounded border-ink/30 text-primary focus:ring-primary/40"
            />
            Counts as Motorcycle Fuel cost
          </label>
          <label className="flex items-center gap-2 text-sm text-ink/70 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isMobileType}
              onChange={(e) => setIsMobileType(e.target.checked)}
              className="rounded border-ink/30 text-primary focus:ring-primary/40"
            />
            Counts as Moblile spending
          </label>
          <label className="flex items-center gap-2 text-sm text-ink/70 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isTuningType}
              onChange={(e) => setIsTuningType(e.target.checked)}
              className="rounded border-ink/30 text-primary focus:ring-primary/40"
            />
            Counts as Tuning spending
          </label>
          <p className="text-xs text-ink/40 -mt-1">
            Any Cash Book or Journal Voucher entry against an account of a type checked here
            automatically counts toward that category in the Motorcycle Report — no separate
            entry needed for the cost side.
          </p>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-lg bg-primary text-white font-semibold hover:bg-primary-dark transition-colors disabled:opacity-60"
            >
              {saving ? "Saving…" : editingId ? "Update" : "Save"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="px-5 py-2.5 rounded-lg border border-ink/15 text-ink/70 font-semibold hover:bg-ink/5 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {loading ? (
          <p className="text-ink/50 text-sm">Loading…</p>
        ) : (
          <div className="bg-white rounded-2xl border border-ink/10 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-ink/[0.03] text-ink/50 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-5 py-3">Serial #</th>
                  <th className="text-left px-5 py-3">Type</th>
                  <th className="text-left px-5 py-3">Receivable / Payable</th>
                  <th className="text-left px-5 py-3">Dashboard</th>
                  <th className="text-right px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                {accountTypes.map((t) => (
                  <tr key={t._id} className={editingId === t._id ? "bg-primary/5" : undefined}>
                    <td className="px-5 py-3 text-ink/70">{t.serial}</td>
                    <td className="px-5 py-3 font-medium text-ink">{t.type}</td>
                    <td className="px-5 py-3 text-ink/60">{t.showInReceivablePayableList ? "Yes" : "—"}</td>
                    <td className="px-5 py-3 text-ink/60">
                      {t.isCashBankType
                        ? "Cash/Bank"
                        : t.isIncomeType
                        ? "Income"
                        : t.isExpenseType
                        ? "Expense"
                        : t.isMotorcycleType
                        ? "Motorcycle"
                        : t.isMobileType
                        ? "Mobile"
                        : t.isTuningType
                        ? "Tuning"
                        : "—"}
                    </td>
                    <td className="px-5 py-3 text-right space-x-2">
                      <button
                        onClick={() => startEdit(t)}
                        aria-label="Edit account type"
                        title="Edit"
                        className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-primary/30 text-primary hover:bg-primary/5 transition-colors"
                      >
                        <FaPen size={12} />
                      </button>
                      <button
                        onClick={() => deleteType(t._id)}
                        aria-label="Delete account type"
                        title="Delete"
                        className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-danger/30 text-danger hover:bg-danger/5 transition-colors"
                      >
                        <FaTrash size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
                {accountTypes.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-ink/40">
                      No account types yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
