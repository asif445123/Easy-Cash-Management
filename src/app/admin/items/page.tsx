"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import AdminHeader from "@/components/AdminHeader";

interface Item {
  _id: string;
  code: string;
  name: string;
  category?: string;
  brand?: string;
  color?: string;
  unit: string;
  costPrice: number;
  salePrice: number;
  currentStock: number;
  reorderLevel: number;
}

interface Lookup {
  _id: string;
  name: string;
}

const emptyForm = {
  code: "",
  name: "",
  category: "",
  brand: "",
  color: "",
  unit: "pcs",
  costPrice: "",
  salePrice: "",
  openingStock: "",
  reorderLevel: "",
};

export default function AdminItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Lookup[]>([]);
  const [brands, setBrands] = useState<Lookup[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  async function loadAll() {
    setLoading(true);
    try {
      const [itemsRes, catRes, brandRes] = await Promise.all([
        fetch("/api/admin/items", { cache: "no-store" }),
        fetch("/api/admin/categories", { cache: "no-store" }),
        fetch("/api/admin/brands", { cache: "no-store" }),
      ]);
      const itemsData = await itemsRes.json();
      const catData = await catRes.json();
      const brandData = await brandRes.json();
      setItems(itemsData.items || []);
      setCategories(catData.categories || []);
      setBrands(brandData.brands || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  function updateField(key: keyof typeof emptyForm, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function addLookup(kind: "categories" | "brands") {
    const { value: name } = await Swal.fire({
      title: kind === "categories" ? "New category" : "New brand",
      input: "text",
      inputPlaceholder: "Name",
      showCancelButton: true,
      confirmButtonColor: "#0E7C4A",
    });
    if (!name?.trim()) return;

    const res = await fetch(`/api/admin/${kind}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    if (!res.ok) {
      Swal.fire({ icon: "error", title: "Failed", text: data.message });
      return;
    }
    loadAll();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          costPrice: Number(form.costPrice) || 0,
          salePrice: Number(form.salePrice) || 0,
          openingStock: Number(form.openingStock) || 0,
          reorderLevel: Number(form.reorderLevel) || 0,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        Swal.fire({ icon: "error", title: "Could not add item", text: data.message });
        return;
      }

      Swal.fire({ icon: "success", title: "Item added", timer: 1000, showConfirmButton: false });
      setForm(emptyForm);
      loadAll();
    } finally {
      setSaving(false);
    }
  }

  async function deleteItem(id: string) {
    const result = await Swal.fire({
      icon: "warning",
      title: "Delete this item?",
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#B3452C",
    });
    if (!result.isConfirmed) return;

    const res = await fetch(`/api/admin/items/${id}`, { method: "DELETE" });
    if (res.ok) {
      loadAll();
    } else {
      Swal.fire({ icon: "error", title: "Failed to delete item" });
    }
  }

  return (
    <main className="min-h-screen bg-paper">
      <AdminHeader />

      <div className="max-w-5xl mx-auto px-6 pb-16">
        <h1 className="font-display text-2xl font-bold text-ink mb-6">Inventory items</h1>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-ink/10 p-6 mb-8 grid sm:grid-cols-3 gap-4"
        >
          <Field label="Item code">
            <input
              required
              value={form.code}
              onChange={(e) => updateField("code", e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Item name" className="sm:col-span-2">
            <input
              required
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              className="input"
            />
          </Field>

          <Field label="Category">
            <div className="flex gap-2">
              <select
                value={form.category}
                onChange={(e) => updateField("category", e.target.value)}
                className="input"
              >
                <option value="">—</option>
                {categories.map((c) => (
                  <option key={c._id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => addLookup("categories")}
                className="px-3 rounded-lg border border-ink/15 text-sm hover:bg-ink/5"
              >
                +
              </button>
            </div>
          </Field>

          <Field label="Brand">
            <div className="flex gap-2">
              <select
                value={form.brand}
                onChange={(e) => updateField("brand", e.target.value)}
                className="input"
              >
                <option value="">—</option>
                {brands.map((b) => (
                  <option key={b._id} value={b.name}>
                    {b.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => addLookup("brands")}
                className="px-3 rounded-lg border border-ink/15 text-sm hover:bg-ink/5"
              >
                +
              </button>
            </div>
          </Field>

          <Field label="Color">
            <input
              value={form.color}
              onChange={(e) => updateField("color", e.target.value)}
              className="input"
            />
          </Field>

          <Field label="Unit">
            <input
              value={form.unit}
              onChange={(e) => updateField("unit", e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Cost price">
            <input
              type="number"
              step="0.01"
              value={form.costPrice}
              onChange={(e) => updateField("costPrice", e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Sale price">
            <input
              type="number"
              step="0.01"
              value={form.salePrice}
              onChange={(e) => updateField("salePrice", e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Opening stock">
            <input
              type="number"
              value={form.openingStock}
              onChange={(e) => updateField("openingStock", e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Reorder level">
            <input
              type="number"
              value={form.reorderLevel}
              onChange={(e) => updateField("reorderLevel", e.target.value)}
              className="input"
            />
          </Field>

          <div className="sm:col-span-3">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-lg bg-primary text-white font-semibold hover:bg-primary-dark transition-colors disabled:opacity-60"
            >
              {saving ? "Adding…" : "Add item"}
            </button>
          </div>
        </form>

        {loading ? (
          <p className="text-ink/50 text-sm">Loading items…</p>
        ) : (
          <div className="bg-white rounded-2xl border border-ink/10 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-ink/[0.03] text-ink/50 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-5 py-3">Code</th>
                  <th className="text-left px-5 py-3">Name</th>
                  <th className="text-left px-5 py-3">Category</th>
                  <th className="text-left px-5 py-3">Brand</th>
                  <th className="text-right px-5 py-3">Cost</th>
                  <th className="text-right px-5 py-3">Sale</th>
                  <th className="text-right px-5 py-3">Stock</th>
                  <th className="text-right px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                {items.map((it) => (
                  <tr key={it._id}>
                    <td className="px-5 py-3 font-medium text-ink">{it.code}</td>
                    <td className="px-5 py-3 text-ink/80">{it.name}</td>
                    <td className="px-5 py-3 text-ink/60">{it.category || "—"}</td>
                    <td className="px-5 py-3 text-ink/60">{it.brand || "—"}</td>
                    <td className="px-5 py-3 text-right text-ink/70">{it.costPrice.toFixed(2)}</td>
                    <td className="px-5 py-3 text-right text-ink/70">{it.salePrice.toFixed(2)}</td>
                    <td className="px-5 py-3 text-right">
                      <span
                        className={
                          it.currentStock <= it.reorderLevel
                            ? "text-danger font-medium"
                            : "text-ink/70"
                        }
                      >
                        {it.currentStock} {it.unit}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => deleteItem(it._id)}
                        className="px-3 py-1.5 rounded-full border border-danger/30 text-danger text-xs font-medium hover:bg-danger/5 transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-5 py-8 text-center text-ink/40">
                      No items yet.
                    </td>
                  </tr>
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
