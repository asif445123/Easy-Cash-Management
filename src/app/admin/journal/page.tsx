"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { FaPen, FaTrash } from "react-icons/fa";
import { safeJson } from "@/lib/api-client";
import AdminHeader from "@/components/AdminHeader";
import AccountPicker from "@/components/AccountPicker";
import NarrationInput from "@/components/NarrationInput";

interface Account {
  _id: string;
  code: string;
  description: string;
}

interface JournalEntry {
  entryNo: number;
  accountCode: string;
  narration: string;
  debit: number;
  credit: number;
}

interface JournalVoucher {
  _id: string;
  serialNumber: number;
  date: string;
  entries: JournalEntry[];
  totalDebit: number;
  totalCredit: number;
}

const emptyLine = { accountCode: "", narration: "", debit: "", credit: "" };

type SearchMode = "serial" | "date" | "narration" | "account";

export default function JournalVoucherPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [lines, setLines] = useState<Array<typeof emptyLine>>([{ ...emptyLine }, { ...emptyLine }]);
  const [vouchers, setVouchers] = useState<JournalVoucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Narrations this user has typed before, for the datalist autocomplete.
  const [narrationSuggestions, setNarrationSuggestions] = useState<string[]>([]);

  // Search / filter over the loaded voucher list.
  const [searchMode, setSearchMode] = useState<SearchMode>("serial");
  const [searchText, setSearchText] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [searchAccountCode, setSearchAccountCode] = useState("");

  async function loadAll() {
    setLoading(true);
    try {
      const [accRes, jvRes] = await Promise.all([
        fetch("/api/admin/accounts", { cache: "no-store" }),
        fetch("/api/admin/journal", { cache: "no-store" }),
      ]);
      const accData = await accRes.json();
      const jvData = await jvRes.json();
      setAccounts(accData.accounts || []);
      setVouchers(jvData.vouchers || []);
    } finally {
      setLoading(false);
    }
  }

  async function loadNarrationSuggestions() {
    const res = await fetch("/api/admin/journal/narrations", { cache: "no-store" });
    const data = await res.json();
    setNarrationSuggestions(data.narrations || []);
  }

  useEffect(() => {
    loadAll();
    loadNarrationSuggestions();
  }, []);

  function resetSearch() {
    setSearchText("");
    setSearchDate("");
    setSearchAccountCode("");
  }

  function changeSearchMode(mode: SearchMode) {
    setSearchMode(mode);
    resetSearch();
  }

  const searchActive =
    searchMode === "date" ? !!searchDate : searchMode === "account" ? !!searchAccountCode : !!searchText.trim();

  const filteredVouchers = vouchers.filter((v) => {
    if (!searchActive) return true;
    if (searchMode === "serial") {
      return String(v.serialNumber).includes(searchText.trim());
    }
    if (searchMode === "date") {
      return v.date.slice(0, 10) === searchDate;
    }
    if (searchMode === "narration") {
      const q = searchText.trim().toLowerCase();
      return v.entries.some((e) => e.narration?.toLowerCase().includes(q));
    }
    if (searchMode === "account") {
      return v.entries.some((e) => e.accountCode === searchAccountCode);
    }
    return true;
  });

  function updateLine(index: number, key: keyof typeof emptyLine, value: string) {
    setLines((ls) => ls.map((l, i) => (i === index ? { ...l, [key]: value } : l)));
  }

  function addLine() {
    setLines((ls) => [...ls, { ...emptyLine }]);
  }

  function removeLine(index: number) {
    setLines((ls) => (ls.length > 1 ? ls.filter((_, i) => i !== index) : ls));
  }

  function startEdit(v: JournalVoucher) {
    setEditingId(v._id);
    setDate(v.date.slice(0, 10));
    setLines(
      v.entries.map((e) => ({
        accountCode: e.accountCode,
        narration: e.narration || "",
        debit: e.debit ? String(e.debit) : "",
        credit: e.credit ? String(e.credit) : "",
      }))
    );
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setLines([{ ...emptyLine }, { ...emptyLine }]);
    setDate(new Date().toISOString().slice(0, 10));
  }

  async function deleteVoucher(id: string) {
    const result = await Swal.fire({
      icon: "warning",
      title: "Delete this journal voucher?",
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#B3452C",
    });
    if (!result.isConfirmed) return;

    const res = await fetch(`/api/admin/journal/${id}`, { method: "DELETE" });
    if (res.ok) {
      if (editingId === id) cancelEdit();
      loadAll();
    } else {
      Swal.fire({ icon: "error", title: "Failed to delete voucher" });
    }
  }

  const totalDebit = lines.reduce((s, l) => s + (Number(l.debit) || 0), 0);
  const totalCredit = lines.reduce((s, l) => s + (Number(l.credit) || 0), 0);
  const balanced = Math.abs(totalDebit - totalCredit) < 0.01 && totalDebit > 0;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();

    const validLines = lines.filter((l) => l.accountCode && (Number(l.debit) || Number(l.credit)));
    if (validLines.length === 0) {
      Swal.fire({ icon: "warning", title: "Add at least one entry with an amount" });
      return;
    }
    if (!balanced) {
      Swal.fire({
        icon: "warning",
        title: "Debit and credit must be equal",
        text: `Debit: ${totalDebit.toFixed(2)}, Credit: ${totalCredit.toFixed(2)}`,
      });
      return;
    }

    setSaving(true);
    try {
      const url = editingId ? `/api/admin/journal/${editingId}` : "/api/admin/journal";
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          entries: validLines.map((l) => ({
            accountCode: l.accountCode,
            narration: l.narration,
            debit: Number(l.debit) || 0,
            credit: Number(l.credit) || 0,
          })),
        }),
      });
      const data = await safeJson(res);

      if (!res.ok) {
        Swal.fire({ icon: "error", title: "Could not save", text: data.message });
        return;
      }

      Swal.fire({
        icon: "success",
        title: editingId ? "Journal voucher updated" : "Journal voucher saved",
        timer: 1000,
        showConfirmButton: false,
      });
      cancelEdit();
      loadAll();
      loadNarrationSuggestions();
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-paper">
      <AdminHeader />

      <div className="max-w-6xl mx-auto px-6 pb-16">
        <h1 className="font-display text-2xl font-bold text-ink mb-6">Journal Voucher</h1>

        <form onSubmit={handleSave} className="bg-white rounded-2xl border border-ink/10 p-6 mb-8">
          {editingId && (
            <div className="mb-4 text-xs font-medium text-primary bg-primary/10 rounded-lg px-3 py-2">
              Editing JV {vouchers.find((v) => v._id === editingId)?.serialNumber}
            </div>
          )}
          <div className="mb-4 max-w-xs">
            <Field label="Date">
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input"
              />
            </Field>
          </div>

          {/* overflow-x-auto: on a narrow screen the 4 data columns (Account
              code / Narration / Debit / Credit) don't fit — without this the
              browser used to squeeze the Debit/Credit inputs down until they
              were unusable instead of letting the table scroll sideways. */}
          <div className="border border-ink/10 rounded-lg overflow-x-auto">
            <table className="w-full text-sm min-w-[560px]">
              <thead className="bg-ink/[0.03] text-ink/50 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-3 py-2 w-10">#</th>
                  <th className="text-left px-3 py-2">Account code</th>
                  <th className="text-left px-3 py-2">Narration</th>
                  <th className="text-right px-3 py-2 w-28">Debit</th>
                  <th className="text-right px-3 py-2 w-28">Credit</th>
                  <th className="w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                {lines.map((line, i) => (
                  <tr key={i}>
                    <td className="px-3 py-2 text-ink/50">{i + 1}</td>
                    <td className="px-3 py-2 min-w-[180px]">
                      <AccountPicker
                        accounts={accounts}
                        value={line.accountCode}
                        onChange={(code) => updateLine(i, "accountCode", code)}
                        placeholder="Search account…"
                      />
                    </td>
                    <td className="px-3 py-2 min-w-[160px]">
                      <NarrationInput
                        suggestions={narrationSuggestions}
                        value={line.narration}
                        onChange={(v) => updateLine(i, "narration", v)}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        step="0.01"
                        value={line.debit}
                        onChange={(e) => updateLine(i, "debit", e.target.value)}
                        className="input text-right"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        step="0.01"
                        value={line.credit}
                        onChange={(e) => updateLine(i, "credit", e.target.value)}
                        className="input text-right"
                      />
                    </td>
                    <td className="px-3 py-2 text-center">
                      <button
                        type="button"
                        onClick={() => removeLine(i)}
                        className="text-ink/40 hover:text-danger transition-colors"
                        aria-label="Remove entry"
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            type="button"
            onClick={addLine}
            className="mt-3 text-sm text-primary font-medium hover:underline"
          >
            + Add entry row
          </button>

          <div className="mt-5 grid grid-cols-2 gap-4 text-sm bg-ink/[0.03] rounded-lg p-4">
            <TotalBox label="Total debit" value={totalDebit} />
            <TotalBox label="Total credit" value={totalCredit} highlight={!balanced} />
          </div>
          {!balanced && totalDebit + totalCredit > 0 && (
            <p className="mt-2 text-xs text-danger">Debit and credit must be equal before saving.</p>
          )}

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

        <div className="bg-white rounded-2xl border border-ink/10 p-4 mb-3 flex flex-wrap items-center gap-3">
          {/* overflow-x-auto + flex-nowrap: the search-mode pill group used
              `overflow-hidden` to keep its rounded-corner look, but that meant
              once the 4 buttons didn't fit a narrow screen, "Account Wise"
              was silently clipped off and unreachable rather than just
              visually cut. Now it scrolls instead of clipping. */}
          <div className="flex flex-nowrap rounded-lg border border-ink/15 overflow-x-auto text-sm max-w-full">
            {(["serial", "date", "narration", "account"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => changeSearchMode(mode)}
                className={`px-3 py-1.5 whitespace-nowrap shrink-0 ${
                  searchMode === mode ? "bg-primary text-white" : "text-ink/70 hover:bg-ink/5"
                }`}
              >
                {mode === "serial" ? "JV Wise" : mode === "date" ? "Date Wise" : mode === "narration" ? "Narration Wise" : "Account Wise"}
              </button>
            ))}
          </div>

          {searchMode === "serial" && (
            <input
              type="text"
              inputMode="numeric"
              placeholder="Search JV #…"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="input max-w-[160px]"
            />
          )}
          {searchMode === "date" && (
            <input
              type="date"
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
              className="input max-w-[180px]"
            />
          )}
          {searchMode === "narration" && (
            <input
              type="text"
              placeholder="Search narration…"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="input max-w-[260px]"
            />
          )}
          {searchMode === "account" && (
            <div className="min-w-[220px]">
              <AccountPicker
                accounts={accounts}
                value={searchAccountCode}
                onChange={setSearchAccountCode}
                placeholder="Search account…"
              />
            </div>
          )}

          {searchActive && (
            <button type="button" onClick={resetSearch} className="text-xs text-ink/50 hover:text-ink/80 underline">
              Clear
            </button>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-ink/10 overflow-x-auto">
          <table className="w-full text-sm min-w-[560px]">
            <thead className="bg-ink/[0.03] text-ink/50 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-5 py-3">Serial</th>
                <th className="text-left px-5 py-3">Date</th>
                <th className="text-right px-5 py-3">Total debit</th>
                <th className="text-right px-5 py-3">Total credit</th>
                <th className="text-right px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-ink/40">
                    Loading…
                  </td>
                </tr>
              ) : vouchers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-ink/40">
                    No journal vouchers yet.
                  </td>
                </tr>
              ) : filteredVouchers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-ink/40">
                    No vouchers match your search.
                  </td>
                </tr>
              ) : (
                filteredVouchers.map((v) => (
                  <tr key={v._id} className={editingId === v._id ? "bg-primary/5" : undefined}>
                    <td className="px-5 py-3 font-medium text-ink">JV {v.serialNumber}</td>
                    <td className="px-5 py-3 text-ink/70">{new Date(v.date).toLocaleDateString()}</td>
                    <td className="px-5 py-3 text-right text-ink/70">{v.totalDebit.toFixed(2)}</td>
                    <td className="px-5 py-3 text-right text-ink/70">{v.totalCredit.toFixed(2)}</td>
                    <td className="px-5 py-3 text-right space-x-2">
                      <button
                        onClick={() => startEdit(v)}
                        aria-label="Edit journal voucher"
                        title="Edit"
                        className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-primary/30 text-primary hover:bg-primary/5 transition-colors"
                      >
                        <FaPen size={12} />
                      </button>
                      <button
                        onClick={() => deleteVoucher(v._id)}
                        aria-label="Delete journal voucher"
                        title="Delete"
                        className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-danger/30 text-danger hover:bg-danger/5 transition-colors"
                      >
                        <FaTrash size={12} />
                      </button>
                    </td>
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-ink/80 mb-1">{label}</label>
      {children}
    </div>
  );
}

function TotalBox({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div>
      <p className="text-xs text-ink/50 uppercase tracking-wide mb-1">{label}</p>
      <p className={`font-semibold ${highlight ? "text-danger" : "text-ink"}`}>{value.toFixed(2)}</p>
    </div>
  );
}
