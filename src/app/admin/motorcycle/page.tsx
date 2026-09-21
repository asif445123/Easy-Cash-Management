"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { FaPen, FaTrash } from "react-icons/fa";
import { safeJson } from "@/lib/api-client";
import AdminHeader from "@/components/AdminHeader";
import NarrationInput from "@/components/NarrationInput";

type Tab = "odometer" | "fuel" | "mobile" | "tuning" | "limits";

const TABS: { id: Tab; label: string }[] = [
  { id: "odometer", label: "Odometer" },
  { id: "fuel", label: "Fuel purchases" },
  { id: "mobile", label: "Moblile" },
  { id: "tuning", label: "Tuning" },
  { id: "limits", label: "Set limits" },
];

export default function MotorcyclePage() {
  const [tab, setTab] = useState<Tab>("odometer");

  return (
    <main className="min-h-screen bg-paper">
      <AdminHeader />

      <div className="max-w-3xl mx-auto px-6 pb-16">
        <h1 className="font-display text-2xl font-bold text-ink mb-1">Motorcycle</h1>
        <p className="text-sm text-ink/50 mb-6">
          All motorcycle data — odometer readings, fuel purchases, mobile and tuning readings,
          and your spending limits — is entered here. The Motorcycle Report is read-only and
          just displays what's entered on this page.
        </p>

        <div className="flex gap-2 mb-6 flex-wrap">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={
                tab === t.id
                  ? "px-4 py-2 rounded-full bg-primary text-white text-sm font-medium"
                  : "px-4 py-2 rounded-full border border-ink/15 text-ink/70 text-sm font-medium hover:bg-ink/5 transition-colors"
              }
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "odometer" && <OdometerSection />}
        {tab === "fuel" && <FuelSection />}
        {tab === "mobile" && <ReadingSection kind="mobile" title="Mobile readings" />}
        {tab === "tuning" && <ReadingSection kind="tuning" title="Tuning readings" />}
        {tab === "limits" && <LimitsSection />}
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

/* ---------------------------- Odometer ---------------------------- */

interface OdoReading {
  _id: string;
  date: string;
  reading: number;
  note?: string;
}

function OdometerSection() {
  const [readings, setReadings] = useState<OdoReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [reading, setReading] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [noteSuggestions, setNoteSuggestions] = useState<string[]>([]);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/motorcycle", { cache: "no-store" });
      const data = await safeJson(res);
      setReadings(data.readings || []);
    } finally {
      setLoading(false);
    }
  }

  async function loadNoteSuggestions() {
    const res = await fetch("/api/admin/motorcycle/notes", { cache: "no-store" });
    const data = await safeJson(res);
    setNoteSuggestions(data.notes || []);
  }

  useEffect(() => {
    load();
    loadNoteSuggestions();
  }, []);

  function startEdit(r: OdoReading) {
    setEditingId(r._id);
    setDate(r.date.slice(0, 10));
    setReading(String(r.reading));
    setNote(r.note || "");
  }

  function cancelEdit() {
    setEditingId(null);
    setDate(new Date().toISOString().slice(0, 10));
    setReading("");
    setNote("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingId ? `/api/admin/motorcycle/${editingId}` : "/api/admin/motorcycle";
      const method = editingId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, reading: Number(reading), note }),
      });
      const data = await safeJson(res);
      if (!res.ok) {
        Swal.fire({ icon: "error", title: "Could not save", text: data.message });
        return;
      }
      Swal.fire({ icon: "success", title: editingId ? "Updated" : "Saved", timer: 900, showConfirmButton: false });
      cancelEdit();
      load();
      loadNoteSuggestions();
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
    const res = await fetch(`/api/admin/motorcycle/${id}`, { method: "DELETE" });
    if (res.ok) {
      if (editingId === id) cancelEdit();
      load();
    }
  }

  // KM since last = this reading minus the previous one, chronologically.
  // Computed in ascending (oldest-first) order first since each row needs
  // its true predecessor, then reversed so the list displays newest-first.
  const readingsAscending = [...readings].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const withKm = readingsAscending.map((r, i) => ({
    ...r,
    km: i === 0 ? null : r.reading - readingsAscending[i - 1].reading,
  }));
  const withKmNewestFirst = [...withKm].reverse();

  return (
    <div>
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-ink/10 p-6 mb-6 grid sm:grid-cols-3 gap-4">
        {editingId && (
          <div className="sm:col-span-3 text-xs font-medium text-primary bg-primary/10 rounded-lg px-3 py-2">
            Editing this reading
          </div>
        )}
        <Field label="Date">
          <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="input" />
        </Field>
        <Field label="Odometer reading">
          <input type="number" required value={reading} onChange={(e) => setReading(e.target.value)} className="input" />
        </Field>
        <Field label="Note (optional)">
          <NarrationInput suggestions={noteSuggestions} value={note} onChange={setNote} placeholder="Note" />
        </Field>
        <div className="sm:col-span-3 flex gap-3">
          <SaveButtons saving={saving} editing={!!editingId} onCancel={cancelEdit} />
        </div>
      </form>

      {loading ? (
        <p className="text-ink/50 text-sm">Loading…</p>
      ) : (
        <Table
          headers={["Date", "Reading", "KM since last", "Note", "Actions"]}
          rows={withKmNewestFirst}
          renderRow={(r) => (
            <tr key={r._id} className={editingId === r._id ? "bg-primary/5" : undefined}>
              <td className="px-5 py-3 text-ink/70">{new Date(r.date).toLocaleDateString()}</td>
              <td className="px-5 py-3 text-right font-medium text-ink">{r.reading}</td>
              <td className="px-5 py-3 text-right text-ink/70">{r.km === null ? "—" : r.km}</td>
              <td className="px-5 py-3 text-ink/60">{r.note || "—"}</td>
              <td className="px-5 py-3 text-right space-x-2">
                <RowActions onEdit={() => startEdit(r)} onDelete={() => del(r._id)} />
              </td>
            </tr>
          )}
        />
      )}
    </div>
  );
}

/* ------------------------------ Fuel ------------------------------ */

interface FuelPurchase {
  _id: string;
  date: string;
  amount: number;
  rate: number;
  quantity: number;
}

function FuelSection() {
  const [purchases, setPurchases] = useState<FuelPurchase[]>([]);
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
      const res = await fetch("/api/admin/motorcycle/fuel", { cache: "no-store" });
      const data = await safeJson(res);
      setPurchases(data.purchases || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function startEdit(p: FuelPurchase) {
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
      const url = editingId ? `/api/admin/motorcycle/fuel/${editingId}` : "/api/admin/motorcycle/fuel";
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
      title: "Delete this fuel purchase?",
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#B3452C",
    });
    if (!result.isConfirmed) return;
    const res = await fetch(`/api/admin/motorcycle/fuel/${id}`, { method: "DELETE" });
    if (res.ok) {
      if (editingId === id) cancelEdit();
      load();
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-ink/10 p-6 mb-6 grid sm:grid-cols-3 gap-4">
        {editingId && (
          <div className="sm:col-span-3 text-xs font-medium text-primary bg-primary/10 rounded-lg px-3 py-2">
            Editing this fuel purchase
          </div>
        )}
        <Field label="Date">
          <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="input" />
        </Field>
        <Field label="Amount (Rs)">
          <input type="number" step="0.01" required value={amount} onChange={(e) => setAmount(e.target.value)} className="input" />
        </Field>
        <Field label="Rate (Rs per liter)">
          <input type="number" step="0.01" required value={rate} onChange={(e) => setRate(e.target.value)} className="input" />
        </Field>
        {quantityPreview !== null && (
          <p className="sm:col-span-3 text-xs text-ink/50 -mt-2">
            Quantity: <span className="font-medium text-ink">{quantityPreview.toFixed(2)} liters</span> (calculated automatically)
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
              <td className="px-5 py-3 text-right text-ink/70">{p.quantity.toFixed(2)} L</td>
              <td className="px-5 py-3 text-right space-x-2">
                <RowActions onEdit={() => startEdit(p)} onDelete={() => del(p._id)} />
              </td>
            </tr>
          )}
        />
      )}
    </div>
  );
}

/* -------------------------- Mobile / Tuning ------------------------- */

interface ReadingEntry {
  _id: string;
  date: string;
  reading: number;
}

function ReadingSection({ kind, title }: { kind: "mobile" | "tuning"; title: string }) {
  const [items, setItems] = useState<ReadingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [reading, setReading] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const base = `/api/admin/motorcycle/${kind}`;

  const itemsNewestFirst = [...items].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(base, { cache: "no-store" });
      const data = await safeJson(res);
      setItems(data.readings || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind]);

  function startEdit(r: ReadingEntry) {
    setEditingId(r._id);
    setDate(r.date.slice(0, 10));
    setReading(String(r.reading));
  }

  function cancelEdit() {
    setEditingId(null);
    setDate(new Date().toISOString().slice(0, 10));
    setReading("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingId ? `${base}/${editingId}` : base;
      const method = editingId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, reading: Number(reading) }),
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
      title: "Delete this reading?",
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#B3452C",
    });
    if (!result.isConfirmed) return;
    const res = await fetch(`${base}/${id}`, { method: "DELETE" });
    if (res.ok) {
      if (editingId === id) cancelEdit();
      load();
    }
  }

  return (
    <div>
      <h2 className="font-display font-semibold text-ink mb-3">{title}</h2>
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-ink/10 p-6 mb-6 grid sm:grid-cols-3 gap-4">
        {editingId && (
          <div className="sm:col-span-3 text-xs font-medium text-primary bg-primary/10 rounded-lg px-3 py-2">
            Editing this reading
          </div>
        )}
        <Field label="Date">
          <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="input" />
        </Field>
        <Field label="Reading">
          <input type="number" required value={reading} onChange={(e) => setReading(e.target.value)} className="input" />
        </Field>
        <p className="sm:col-span-3 text-xs text-ink/40 -mt-2">
          Record the motorcycle's odometer reading at the moment you actually changed the
          {kind === "mobile" ? " mobile" : " tuning"} — the report compares this against the
          bike's current reading (from the Odometer tab) and your limit (Set limits tab).
        </p>
        <div className="sm:col-span-3 flex gap-3">
          <SaveButtons saving={saving} editing={!!editingId} onCancel={cancelEdit} />
        </div>
      </form>

      {loading ? (
        <p className="text-ink/50 text-sm">Loading…</p>
      ) : (
        <Table
          headers={["Date", "Reading", "Actions"]}
          rows={itemsNewestFirst}
          renderRow={(r) => (
            <tr key={r._id} className={editingId === r._id ? "bg-primary/5" : undefined}>
              <td className="px-5 py-3 text-ink/70">{new Date(r.date).toLocaleDateString()}</td>
              <td className="px-5 py-3 text-right font-medium text-ink">{r.reading}</td>
              <td className="px-5 py-3 text-right space-x-2">
                <RowActions onEdit={() => startEdit(r)} onDelete={() => del(r._id)} />
              </td>
            </tr>
          )}
        />
      )}
    </div>
  );
}

/* ------------------------------ Limits ------------------------------ */

function LimitsSection() {
  const [mobileLimit, setMobileLimit] = useState("");
  const [tuningLimit, setTuningLimit] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/motorcycle/limits", { cache: "no-store" });
      const data = await safeJson(res);
      if (res.ok) {
        setMobileLimit(String(data.mobileLimit ?? ""));
        setTuningLimit(String(data.tuningLimit ?? ""));
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/motorcycle/limits", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobileLimit: Number(mobileLimit) || 0, tuningLimit: Number(tuningLimit) || 0 }),
      });
      const data = await safeJson(res);
      if (!res.ok) {
        Swal.fire({ icon: "error", title: "Could not save", text: data.message });
        return;
      }
      Swal.fire({ icon: "success", title: "Limits saved", timer: 900, showConfirmButton: false });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-ink/50 text-sm">Loading…</p>;

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-ink/10 p-6 grid sm:grid-cols-2 gap-4 max-w-md">
      <Field label="Mobile limit (Rs)">
        <input type="number" value={mobileLimit} onChange={(e) => setMobileLimit(e.target.value)} className="input" />
      </Field>
      <Field label="Tuning limit (Rs)">
        <input type="number" value={tuningLimit} onChange={(e) => setTuningLimit(e.target.value)} className="input" />
      </Field>
      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2.5 rounded-lg bg-primary text-white font-semibold hover:bg-primary-dark transition-colors disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save limits"}
        </button>
      </div>
    </form>
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
  const rightAlignHeaders = new Set([
    "Reading",
    "Amount",
    "Rate",
    "Quantity",
    "KM since last",
    "Change amount",
    "Actions",
  ]);
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
