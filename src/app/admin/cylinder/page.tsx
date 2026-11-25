"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { FaPen, FaTrash } from "react-icons/fa";
import { safeJson } from "@/lib/api-client";
import AdminHeader from "@/components/AdminHeader";

interface CylinderPurchase {
  _id: string;
  date: string;
  amount: number;
  rate: number;
  quantity: number;
}

export default function CylinderPage() {
  const [purchases, setPurchases] = useState<CylinderPurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [amount, setAmount] = useState("");
  const [rate, setRate] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const quantityPreview = Number(amount) > 0 && Number(rate) > 0 ? Number(amount) / Number(rate) : null;

  const purchasesNewestFirst = [...purchases].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/cylinder", { cache: "no-store" });
      const data = await safeJson(res);
      setPurchases(data.purchases || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function startEdit(p: CylinderPurchase) {
    setEditingId(p._id);
    setDate(p.date.slice(0, 10));
    setAmount(String(p.amount));
    setRate(String(p.rate));
  }

  function cancelEdit() {
    setEditingId(null);
    setDate(new Date().toISOString().slice(0, 10));
    setAmount("");
    setRate("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingId ? `/api/admin/cylinder/${editingId}` : "/api/admin/cylinder";
      const method = editingId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, amount: Number(amount), rate: Number(rate) }),
      });
      const data = await safeJson(res);
      if (!res.ok) {
        Swal.fire({ icon: "error", title: "Could not save", text: data.message });
        return;
      }
      Swal.fire({ icon: "success", title: editingId ? "Updated" : "Saved", timer: 900, showConfirmButton: false });
      cancelEdit();
      load();
    } finally {
      setSaving(false);
    }
  }

  async function del(id: string) {
    const result = await Swal.fire({
      icon: "warning",
      title: "Delete this cylinder purchase?",
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#B3452C",
    });
    if (!result.isConfirmed) return;
    const res = await fetch(`/api/admin/cylinder/${id}`, { method: "DELETE" });
    if (res.ok) {
      if (editingId === id) cancelEdit();
      load();
    }
  }

  return (
    <main className="min-h-screen bg-paper">
      <AdminHeader />

      <div className="max-w-3xl mx-auto px-6 pb-16">
        <h1 className="font-display text-2xl font-bold text-ink mb-1">Cylinder</h1>
        <p className="text-sm text-ink/50 mb-6">
          Enter each cylinder (gas) purchase here. The Cylinder Report is read-only and just
          displays what's entered on this page.
        </p>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-ink/10 p-6 mb-6 grid sm:grid-cols-3 gap-4">
          {editingId && (
            <div className="sm:col-span-3 text-xs font-medium text-primary bg-primary/10 rounded-lg px-3 py-2">
              Editing this cylinder purchase
            </div>
          )}
          <Field label="Date">
            <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="input" />
          </Field>
          <Field label="Amount (Rs)">
            <input type="number" step="0.01" required value={amount} onChange={(e) => setAmount(e.target.value)} className="input" />
          </Field>
          <Field label="Rate (Rs per kg)">
            <input type="number" step="0.01" required value={rate} onChange={(e) => setRate(e.target.value)} className="input" />
          </Field>
          {quantityPreview !== null && (
            <p className="sm:col-span-3 text-xs text-ink/50 -mt-2">
              Quantity: <span className="font-medium text-ink">{quantityPreview.toFixed(2)} kg</span> (calculated automatically)
            </p>
          )}
          <div className="sm:col-span-3 flex gap-3">
            <SaveButtons saving={saving} editing={!!editingId} onCancel={cancelEdit} />
          </div>
        </form>

        {loading ? (
          <p className="text-ink/50 text-sm">Loading…</p>
        ) : (
          <Table
            headers={["Date", "Amount", "Rate", "Quantity", "Actions"]}
            rows={purchasesNewestFirst}
            renderRow={(p) => (
              <tr key={p._id} className={editingId === p._id ? "bg-primary/5" : undefined}>
                <td className="px-5 py-3 text-ink/70">{new Date(p.date).toLocaleDateString()}</td>
                <td className="px-5 py-3 text-right text-ink">Rs {p.amount.toLocaleString()}</td>
                <td className="px-5 py-3 text-right text-ink/70">Rs {p.rate}</td>
                <td className="px-5 py-3 text-right text-ink/70">{p.quantity.toFixed(2)} kg</td>
                <td className="px-5 py-3 text-right space-x-2">
                  <RowActions onEdit={() => startEdit(p)} onDelete={() => del(p._id)} />
                </td>
              </tr>
            )}
          />
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

/* ----------------------------- Shared UI ----------------------------- */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-ink/80 mb-1">{label}</label>
      {children}
    </div>
  );
}

function SaveButtons({ saving, editing, onCancel }: { saving: boolean; editing: boolean; onCancel: () => void }) {
  return (
    <>
      <button
        type="submit"
        disabled={saving}
        className="px-5 py-2.5 rounded-lg bg-primary text-white font-semibold hover:bg-primary-dark transition-colors disabled:opacity-60"
      >
        {saving ? "Saving…" : editing ? "Update" : "Save"}
      </button>
      {editing && (
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 rounded-lg border border-ink/15 text-ink/70 font-semibold hover:bg-ink/5 transition-colors"
        >
          Cancel
        </button>
      )}
    </>
  );
}

function RowActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <>
      <button
        onClick={onEdit}
        aria-label="Edit"
        title="Edit"
        className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-primary/30 text-primary hover:bg-primary/5 transition-colors"
      >
        <FaPen size={12} />
      </button>
      <button
        onClick={onDelete}
        aria-label="Delete"
        title="Delete"
        className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-danger/30 text-danger hover:bg-danger/5 transition-colors"
      >
        <FaTrash size={12} />
      </button>
    </>
  );
}

function Table<T>({
  headers,
  rows,
  renderRow,
}: {
  headers: string[];
  rows: T[];
  renderRow: (row: T) => React.ReactNode;
}) {
  const rightAlignHeaders = new Set(["Amount", "Rate", "Quantity", "Actions"]);
  return (
    <div className="bg-white rounded-2xl border border-ink/10 overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-ink/[0.03] text-ink/50 text-xs uppercase tracking-wide">
          <tr>
            {headers.map((h) => (
              <th key={h} className={rightAlignHeaders.has(h) ? "text-right px-5 py-3" : "text-left px-5 py-3"}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-ink/5">
          {rows.length === 0 ? (
            <tr>
              <td colSpan={headers.length} className="px-5 py-8 text-center text-ink/40">
                No entries yet.
              </td>
            </tr>
          ) : (
            rows.map(renderRow)
          )}
        </tbody>
      </table>
    </div>
  );
}
