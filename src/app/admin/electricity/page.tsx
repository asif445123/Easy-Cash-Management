"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { FaPen, FaTrash, FaPlus } from "react-icons/fa";
import { safeJson } from "@/lib/api-client";
import AdminHeader from "@/components/AdminHeader";

type Tab = "reading" | "bill";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DEFAULT_CHARGE_LABELS = [
  "100 Units @ 10.54",
  " Units @ 13.01",
  "Fixed Charges",
  "FPA Energy",
  "F.C Surcharge",
  "QTA",
  "Taxes ED",
  "Taxes GST",
  "Taxes on FPA ED",
  "Taxes of FPA GST",
];

const defaultCharges = (): Charge[] =>
  DEFAULT_CHARGE_LABELS.map((label) => ({ label, amount: 0 }));

export default function ElectricityPage() {
  const [tab, setTab] = useState<Tab>("reading");

  return (
    <main className="min-h-screen bg-paper">
      <AdminHeader />

      <div className="max-w-3xl mx-auto px-6 pb-16">
        <h1 className="font-display text-2xl font-bold text-ink mb-1">Electricity Bill</h1>
        <p className="text-sm text-ink/50 mb-6">
          Log daily meter readings here, and enter each bill (its exact period, plus every
          charge line item) when it arrives. The Electricity Bill Report is read-only and
          combines both.
        </p>

        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setTab("reading")}
            className={
              tab === "reading"
                ? "px-4 py-2 rounded-full bg-primary text-white text-sm font-medium"
                : "px-4 py-2 rounded-full border border-ink/15 text-ink/70 text-sm font-medium hover:bg-ink/5 transition-colors"
            }
          >
            Meter Reading
          </button>
          <button
            onClick={() => setTab("bill")}
            className={
              tab === "bill"
                ? "px-4 py-2 rounded-full bg-primary text-white text-sm font-medium"
                : "px-4 py-2 rounded-full border border-ink/15 text-ink/70 text-sm font-medium hover:bg-ink/5 transition-colors"
            }
          >
            Bill
          </button>
        </div>

        {tab === "reading" && <MeterReadingSection />}
        {tab === "bill" && <BillSection />}
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

/* ---------------- Meter Reading tab (unchanged) ---------------- */

interface Reading {
  _id: string;
  date: string;
  reading: number;
  withMotor: boolean;
}

function MeterReadingSection() {
  const [items, setItems] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [reading, setReading] = useState("");
  const [withMotor, setWithMotor] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/electricity/readings", { cache: "no-store" });
      const data = await safeJson(res);
      setItems(data.readings || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function startEdit(r: Reading) {
    setEditingId(r._id);
    setDate(r.date.slice(0, 10));
    setReading(String(r.reading));
    setWithMotor(r.withMotor);
  }

  function cancelEdit() {
    setEditingId(null);
    setDate(new Date().toISOString().slice(0, 10));
    setReading("");
    setWithMotor(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingId ? `/api/admin/electricity/readings/${editingId}` : "/api/admin/electricity/readings";
      const method = editingId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, reading: Number(reading), withMotor }),
      });
      const data = await safeJson(res);
      if (!res.ok) {
        Swal.fire({ icon: "error", title: "Could not save", text: data.message });
        return;
      }
      Swal.fire({
        icon: "success",
        title: editingId ? "Reading updated" : "Reading saved",
        timer: 1000,
        showConfirmButton: false,
      });
      cancelEdit();
      load();
    } finally {
      setSaving(false);
    }
  }

  async function del(id: string) {
    const result = await Swal.fire({
      icon: "warning",
      title: "Delete this reading?",
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#B3452C",
    });
    if (!result.isConfirmed) return;
    const res = await fetch(`/api/admin/electricity/readings/${id}`, { method: "DELETE" });
    if (res.ok) {
      if (editingId === id) cancelEdit();
      load();
    } else {
      Swal.fire({ icon: "error", title: "Failed to delete" });
    }
  }

  const itemsAscending = [...items].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const withUnitSpend = itemsAscending.map((r, i) => ({
    ...r,
    unitSpend: i === 0 ? null : r.reading - itemsAscending[i - 1].reading,
  }));
  const itemsNewestFirst = [...withUnitSpend].reverse();

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl border border-ink/10 p-6 mb-8 grid sm:grid-cols-2 gap-4"
      >
        {editingId && (
          <div className="sm:col-span-2 text-xs font-medium text-primary bg-primary/10 rounded-lg px-3 py-2">
            Editing this reading
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-ink/80 mb-1">Date</label>
          <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="input" />
        </div>
        <div className="flex items-end pb-2">
          <label className="flex items-center gap-2 text-sm text-ink/70 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={withMotor}
              onChange={(e) => setWithMotor(e.target.checked)}
              className="rounded border-ink/30 text-primary focus:ring-primary/40"
            />
            With Motor
          </label>
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-ink/80 mb-1">Meter reading</label>
          <input
            type="number"
            required
            value={reading}
            onChange={(e) => setReading(e.target.value)}
            className="input"
          />
        </div>
        <div className="sm:col-span-2 flex gap-3">
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
                <th className="text-left px-5 py-3">Date</th>
                <th className="text-right px-5 py-3">Reading</th>
                <th className="text-right px-5 py-3">Unit Spend</th>
                <th className="text-center px-5 py-3">With Motor</th>
                <th className="text-right px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {itemsNewestFirst.map((r) => (
                <tr key={r._id} className={editingId === r._id ? "bg-primary/5" : undefined}>
                  <td className="px-5 py-3 text-ink/70">{new Date(r.date).toLocaleDateString()}</td>
                  <td className="px-5 py-3 text-right font-medium text-ink">{r.reading}</td>
                  <td className="px-5 py-3 text-right text-ink/70">
                    {r.unitSpend === null ? "—" : r.unitSpend}
                  </td>
                  <td className="px-5 py-3 text-center">{r.withMotor ? "✓" : "—"}</td>
                  <td className="px-5 py-3 text-right space-x-2">
                    <button
                      onClick={() => startEdit(r)}
                      aria-label="Edit reading"
                      title="Edit"
                      className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-primary/30 text-primary hover:bg-primary/5 transition-colors"
                    >
                      <FaPen size={12} />
                    </button>
                    <button
                      onClick={() => del(r._id)}
                      aria-label="Delete reading"
                      title="Delete"
                      className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-danger/30 text-danger hover:bg-danger/5 transition-colors"
                    >
                      <FaTrash size={12} />
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-ink/40">
                    No readings yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ---------------- Bill tab ---------------- */

interface Charge {
  label: string;
  amount: number;
}

interface Bill {
  _id: string;
  periodStart: string;
  periodEnd: string;
  billMonth?: number; // 0-11
  billYear?: number;
  charges: Charge[];
}

function oneMonthLaterMinusOneDay(dateStr: string): string {
  if (!dateStr) return dateStr;
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + 1);
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

function BillSection() {
  const now = new Date();
  const [items, setItems] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [billMonth, setBillMonth] = useState<number>(now.getMonth());
  const [billYear, setBillYear] = useState<number>(now.getFullYear());
  const [periodStart, setPeriodStart] = useState(() => new Date().toISOString().slice(0, 10));
  const [periodEnd, setPeriodEnd] = useState(() =>
    oneMonthLaterMinusOneDay(new Date().toISOString().slice(0, 10))
  );
  const [charges, setCharges] = useState<Charge[]>(defaultCharges());
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/electricity/bills", { cache: "no-store" });
      const data = await safeJson(res);
      setItems(data.bills || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function startEdit(b: Bill) {
    setEditingId(b._id);
    setPeriodStart(b.periodStart.slice(0, 10));
    setPeriodEnd(b.periodEnd.slice(0, 10));
    if (typeof b.billMonth === "number") setBillMonth(b.billMonth);
    else setBillMonth(new Date(b.periodStart).getMonth());
    if (typeof b.billYear === "number") setBillYear(b.billYear);
    else setBillYear(new Date(b.periodStart).getFullYear());
    setCharges(b.charges.length > 0 ? b.charges.map((c) => ({ ...c })) : defaultCharges());
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    const today = new Date().toISOString().slice(0, 10);
    setPeriodStart(today);
    setPeriodEnd(oneMonthLaterMinusOneDay(today));
    setBillMonth(new Date().getMonth());
    setBillYear(new Date().getFullYear());
    setCharges(defaultCharges());
  }

  function updateCharge(i: number, key: keyof Charge, value: string) {
    setCharges((cs) =>
      cs.map((c, idx) => (idx === i ? { ...c, [key]: key === "amount" ? Number(value) || 0 : value } : c))
    );
  }

  function addCharge() {
    setCharges((cs) => [...cs, { label: "", amount: 0 }]);
  }

  function removeCharge(i: number) {
    setCharges((cs) => cs.filter((_, idx) => idx !== i));
  }

  const total = charges.reduce((s, c) => s + (Number(c.amount) || 0), 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validCharges = charges.filter((c) => c.label.trim());
    if (validCharges.length === 0) {
      Swal.fire({ icon: "warning", title: "Add at least one charge line item" });
      return;
    }

    setSaving(true);
    try {
      const url = editingId ? `/api/admin/electricity/bills/${editingId}` : "/api/admin/electricity/bills";
      const method = editingId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          periodStart,
          periodEnd,
          billMonth,
          billYear,
          charges: validCharges,
        }),
      });
      const data = await safeJson(res);
      if (!res.ok) {
        Swal.fire({ icon: "error", title: "Could not save", text: data.message });
        return;
      }
      Swal.fire({
        icon: "success",
        title: editingId ? "Bill updated" : "Bill saved",
        timer: 1000,
        showConfirmButton: false,
      });
      cancelEdit();
      load();
    } finally {
      setSaving(false);
    }
  }

  async function del(id: string) {
    const result = await Swal.fire({
      icon: "warning",
      title: "Delete this bill?",
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#B3452C",
    });
    if (!result.isConfirmed) return;
    const res = await fetch(`/api/admin/electricity/bills/${id}`, { method: "DELETE" });
    if (res.ok) {
      if (editingId === id) cancelEdit();
      load();
    } else {
      Swal.fire({ icon: "error", title: "Failed to delete" });
    }
  }

  const currentYear = new Date().getFullYear();
  const yearOptions: number[] = [];
  for (let y = currentYear - 5; y <= currentYear + 2; y++) yearOptions.push(y);

  function labelForBill(b: Bill): string {
    if (typeof b.billMonth === "number" && typeof b.billYear === "number") {
      return `${MONTHS[b.billMonth]} ${b.billYear}`;
    }
    // Fallback: derive from periodStart
    const d = new Date(b.periodStart);
    return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-ink/10 p-6 mb-8">
        {editingId && (
          <div className="mb-4 text-xs font-medium text-primary bg-primary/10 rounded-lg px-3 py-2">
            Editing this bill
          </div>
        )}

        {/* Month selector — shown BEFORE period start/end */}
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-ink/80 mb-1">Bill month</label>
            <select
              value={billMonth}
              onChange={(e) => setBillMonth(Number(e.target.value))}
              className="input"
              required
            >
              {MONTHS.map((m, i) => (
                <option key={m} value={i}>
                  {m}
                </option>
              ))}
            </select>
            <p className="text-xs text-ink/40 mt-1">The month this bill represents.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink/80 mb-1">Bill year</label>
            <select
              value={billYear}
              onChange={(e) => setBillYear(Number(e.target.value))}
              className="input"
              required
            >
              {yearOptions.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-ink/80 mb-1">Period start</label>
            <input
              type="date"
              required
              value={periodStart}
              onChange={(e) => {
                const newStart = e.target.value;
                setPeriodStart(newStart);
                setPeriodEnd(oneMonthLaterMinusOneDay(newStart));
              }}
              className="input"
            />
            <p className="text-xs text-ink/40 mt-1">The date of your meter reading that starts this bill.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink/80 mb-1">Period end</label>
            <input
              type="date"
              required
              value={periodEnd}
              onChange={(e) => setPeriodEnd(e.target.value)}
              className="input"
            />
            <p className="text-xs text-ink/40 mt-1">
              Auto-filled to one month later — adjust only if your billing cycle isn't exactly a
              month.
            </p>
          </div>
        </div>

        <div className="border border-ink/10 rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-ink/[0.03] text-ink/50 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-3 py-2">Charge</th>
                <th className="text-right px-3 py-2 w-32">Amount</th>
                <th className="w-8"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {charges.map((c, i) => (
                <tr key={i}>
                  <td className="px-3 py-2">
                    <input
                      value={c.label}
                      onChange={(e) => updateCharge(i, "label", e.target.value)}
                      className="input"
                      placeholder="Charge label"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      step="0.01"
                      value={c.amount || ""}
                      onChange={(e) => updateCharge(i, "amount", e.target.value)}
                      className="input text-right"
                    />
                  </td>
                  <td className="px-3 py-2 text-center">
                    <button
                      type="button"
                      onClick={() => removeCharge(i)}
                      className="text-ink/40 hover:text-danger transition-colors"
                      aria-label="Remove charge"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-3 flex items-center gap-4">
          <button
            type="button"
            onClick={addCharge}
            className="inline-flex items-center gap-1.5 text-sm text-primary font-medium hover:underline"
          >
            <FaPlus size={10} /> Add charge
          </button>
          <button
            type="button"
            onClick={() => setCharges(defaultCharges())}
            className="text-sm text-ink/50 hover:text-ink/80 hover:underline"
          >
            Reset to default charges
          </button>
        </div>

        <div className="mt-5 bg-ink/[0.03] rounded-lg p-4 flex items-center justify-between">
          <span className="text-sm text-ink/60">Total</span>
          <span className="font-display text-lg font-bold text-ink">Rs {total.toLocaleString()}</span>
        </div>

        <div className="mt-5 flex gap-3">
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
        <div className="space-y-4">
          {items.map((b) => {
            const billTotal = b.charges.reduce((s, c) => s + c.amount, 0);
            return (
              <div key={b._id} className="bg-white rounded-2xl border border-ink/10 p-5">
                <div className="flex items-center justify-between mb-2">
                  {/* Show ONLY the selected month (no dates) */}
                  <p className="font-medium text-ink text-sm">{labelForBill(b)}</p>
                  <div className="space-x-2">
                    <button
                      onClick={() => startEdit(b)}
                      aria-label="Edit bill"
                      title="Edit"
                      className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-primary/30 text-primary hover:bg-primary/5 transition-colors"
                    >
                      <FaPen size={12} />
                    </button>
                    <button
                      onClick={() => del(b._id)}
                      aria-label="Delete bill"
                      title="Delete"
                      className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-danger/30 text-danger hover:bg-danger/5 transition-colors"
                    >
                      <FaTrash size={12} />
                    </button>
                  </div>
                </div>
                <ul className="text-sm text-ink/60 space-y-0.5 mb-2">
                  {b.charges.map((c, i) => (
                    <li key={i} className="flex justify-between">
                      <span>{c.label}</span>
                      <span>Rs {c.amount.toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex justify-between text-sm font-semibold text-ink border-t border-ink/10 pt-2">
                  <span>Total</span>
                  <span>Rs {billTotal.toLocaleString()}</span>
                </div>
              </div>
            );
          })}
          {items.length === 0 && <p className="text-ink/40 text-sm text-center py-8">No bills yet.</p>}
        </div>
      )}
    </div>
  );
}