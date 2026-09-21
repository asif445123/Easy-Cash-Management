"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { FaPen, FaTrash } from "react-icons/fa";
import { safeJson } from "@/lib/api-client";
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
  address?: string;
  telephone?: string;
  mobile?: string;
  fax?: string;
  email?: string;
  openingDebit: number;
  openingCredit: number;
  creditLimit: number;
}

const emptyForm = {
  type: "",
  code: "",
  description: "",
  address: "",
  telephone: "",
  mobile: "",
  fax: "",
  email: "",
  openingDebit: "",
  openingCredit: "",
  creditLimit: "",
};

/** Suggests the next account code as (highest existing numeric code) + 1,
 * padded to match the width of existing codes (e.g. 102001 -> 102002).
 * Falls back to "100001" when there are no accounts yet. Purely a
 * starting suggestion — the field stays editable so codes can still
 * follow a type-based scheme if needed. */
function computeNextCode(accounts: Account[]): string {
  const numeric = accounts.filter((a) => /^\d+$/.test(a.code));
  if (numeric.length === 0) return "1";
  const widest = numeric.reduce((a, b) => (b.code.length > a.code.length ? b : a));
  const max = Math.max(...numeric.map((a) => parseInt(a.code, 10)));
  return String(max + 1).padStart(widest.code.length, "0");
}

export default function AccountsMasterPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountTypes, setAccountTypes] = useState<AccountType[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function loadAll() {
    setLoading(true);
    try {
      const [accRes, typeRes] = await Promise.all([
        fetch("/api/admin/accounts", { cache: "no-store" }),
        fetch("/api/admin/account-types", { cache: "no-store" }),
      ]);
      const accData = await accRes.json();
      const typeData = await typeRes.json();
      setAccounts(accData.accounts || []);
      setAccountTypes(typeData.accountTypes || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  // Pre-fill the suggested next code whenever we're adding a new account
  // (not editing) and the code field is currently empty — runs whenever
  // the accounts list or edit state changes, so it always reflects the
  // latest data rather than a stale value from before a save.
  useEffect(() => {
    if (!editingId) {
      setForm((f) => (f.code ? f : { ...f, code: computeNextCode(accounts) }));
    }
  }, [accounts, editingId]);

  function updateField(key: keyof typeof emptyForm, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function startEdit(a: Account) {
    setEditingId(a._id);
    setForm({
      type: a.type,
      code: a.code,
      description: a.description,
      address: a.address || "",
      telephone: a.telephone || "",
      mobile: a.mobile || "",
      fax: a.fax || "",
      email: a.email || "",
      openingDebit: String(a.openingDebit ?? ""),
      openingCredit: String(a.openingCredit ?? ""),
      creditLimit: String(a.creditLimit ?? ""),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingId ? `/api/admin/accounts/${editingId}` : "/api/admin/accounts";
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          openingDebit: Number(form.openingDebit) || 0,
          openingCredit: Number(form.openingCredit) || 0,
          creditLimit: Number(form.creditLimit) || 0,
        }),
      });
      const data = await safeJson(res);

      if (!res.ok) {
        Swal.fire({ icon: "error", title: "Could not save account", text: data.message });
        return;
      }

      Swal.fire({
        icon: "success",
        title: editingId ? "Account updated" : "Account saved",
        timer: 1000,
        showConfirmButton: false,
      });
      cancelEdit();
      loadAll();
    } finally {
      setSaving(false);
    }
  }

  async function deleteAccount(id: string) {
    const result = await Swal.fire({
      icon: "warning",
      title: "Delete this account?",
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#B3452C",
    });
    if (!result.isConfirmed) return;

    const res = await fetch(`/api/admin/accounts/${id}`, { method: "DELETE" });
    if (res.ok) {
      if (editingId === id) cancelEdit();
      loadAll();
    } else {
      Swal.fire({ icon: "error", title: "Failed to delete account" });
    }
  }

  return (
    <main className="min-h-screen bg-paper">
      <AdminHeader />

      <div className="max-w-4xl mx-auto px-6 pb-16">
        <h1 className="font-display text-2xl font-bold text-ink mb-6">Accounts Master File</h1>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-ink/10 p-6 mb-8 grid sm:grid-cols-2 gap-4"
        >
          {editingId && (
            <div className="sm:col-span-2 text-xs font-medium text-primary bg-primary/10 rounded-lg px-3 py-2">
              Editing existing account — code cannot be changed while editing
            </div>
          )}
          <Field label="Type">
            <select
              required
              value={form.type}
              onChange={(e) => updateField("type", e.target.value)}
              className="input"
            >
              <option value="">Select type…</option>
              {accountTypes.map((t) => (
                <option key={t._id} value={t.type}>
                  {t.type}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Account code">
            <input
              required
              disabled={!!editingId}
              value={form.code}
              onChange={(e) => updateField("code", e.target.value)}
              className="input disabled:bg-ink/5 disabled:text-ink/40"
            />
          </Field>
          <Field label="Description" className="sm:col-span-2">
            <input
              required
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Address" className="sm:col-span-2">
            <input value={form.address} onChange={(e) => updateField("address", e.target.value)} className="input" />
          </Field>
          <Field label="Telephone #">
            <input value={form.telephone} onChange={(e) => updateField("telephone", e.target.value)} className="input" />
          </Field>
          <Field label="Mobile #">
            <input value={form.mobile} onChange={(e) => updateField("mobile", e.target.value)} className="input" />
          </Field>
          <Field label="Fax #">
            <input value={form.fax} onChange={(e) => updateField("fax", e.target.value)} className="input" />
          </Field>
          <Field label="Email">
            <input type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} className="input" />
          </Field>
          <Field label="Opening Debit">
            <input
              type="number"
              step="0.01"
              value={form.openingDebit}
              onChange={(e) => updateField("openingDebit", e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Opening Credit">
            <input
              type="number"
              step="0.01"
              value={form.openingCredit}
              onChange={(e) => updateField("openingCredit", e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Credit Limit">
            <input
              type="number"
              step="0.01"
              value={form.creditLimit}
              onChange={(e) => updateField("creditLimit", e.target.value)}
              className="input"
            />
          </Field>

          <div className="sm:col-span-2 flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-lg bg-primary text-white font-semibold hover:bg-primary-dark transition-colors disabled:opacity-60"
            >
              {saving ? "Saving…" : editingId ? "Update account" : "Save account"}
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
          <p className="text-ink/50 text-sm">Loading accounts…</p>
        ) : (
          <div className="bg-white rounded-2xl border border-ink/10 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-ink/[0.03] text-ink/50 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-5 py-3">Code</th>
                  <th className="text-left px-5 py-3">Description</th>
                  <th className="text-left px-5 py-3">Type</th>
                  <th className="text-right px-5 py-3">Op. Debit</th>
                  <th className="text-right px-5 py-3">Op. Credit</th>
                  <th className="text-right px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                {accounts.map((a) => (
                  <tr key={a._id} className={editingId === a._id ? "bg-primary/5" : undefined}>
                    <td className="px-5 py-3 font-medium text-ink">{a.code}</td>
                    <td className="px-5 py-3 text-ink/80">{a.description}</td>
                    <td className="px-5 py-3 text-ink/60">{a.type}</td>
                    <td className="px-5 py-3 text-right text-ink/70">{a.openingDebit.toFixed(2)}</td>
                    <td className="px-5 py-3 text-right text-ink/70">{a.openingCredit.toFixed(2)}</td>
                    <td className="px-5 py-3 text-right space-x-2">
                      <button
                        onClick={() => startEdit(a)}
                        aria-label="Edit account"
                        title="Edit"
                        className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-primary/30 text-primary hover:bg-primary/5 transition-colors"
                      >
                        <FaPen size={12} />
                      </button>
                      <button
                        onClick={() => deleteAccount(a._id)}
                        aria-label="Delete account"
                        title="Delete"
                        className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-danger/30 text-danger hover:bg-danger/5 transition-colors"
                      >
                        <FaTrash size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
                {accounts.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-ink/40">
                      No accounts yet.
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

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-ink/80 mb-1">{label}</label>
      {children}
    </div>
  );
}
