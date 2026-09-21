  "use client";

  import { useEffect, useState } from "react";
  import Swal from "sweetalert2";
  import { FaPen, FaTrash } from "react-icons/fa";
  import { safeJson } from "@/lib/api-client";
  import AccountPicker from "@/components/AccountPicker";
  import NarrationInput from "@/components/NarrationInput";
  import AdminHeader from "@/components/AdminHeader";

  interface Account {
    _id: string;
    code: string;
    description: string;
    openingDebit: number;
    openingCredit: number;
  }

  interface CashEntry {
    entryNo: number;
    accountCode: string;
    narration: string;
    receipt: number;
    payment: number;
  }

  interface CashVoucher {
    _id: string;
    serialNumber: number;
    cashBankAccountCode: string;
    date: string;
    entries: CashEntry[];
    totalReceipt: number;
    totalPayment: number;
  }

  const emptyLine = { accountCode: "", narration: "", receipt: "", payment: "" };

  type SearchMode = "serial" | "date" | "narration" | "account";

  export default function CashBookPage() {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [cashBankCode, setCashBankCode] = useState("");
    const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
    const [lines, setLines] = useState<Array<typeof emptyLine>>([{ ...emptyLine }]);
    const [vouchers, setVouchers] = useState<CashVoucher[]>([]);
    const [opening, setOpening] = useState(0);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // When editing an existing voucher, we subtract its own original net
    // (receipt - payment) out of "opening" for the live preview, since that
    // voucher's amount is already baked into the opening balance from the
    // server and we don't want to double-count it while editing.
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingOriginalNet, setEditingOriginalNet] = useState(0);

    // Narrations this user has typed before, for the datalist autocomplete.
    const [narrationSuggestions, setNarrationSuggestions] = useState<string[]>([]);

    // Search / filter over the loaded voucher list for this account.
    const [searchMode, setSearchMode] = useState<SearchMode>("serial");
    const [searchText, setSearchText] = useState("");
    const [searchDate, setSearchDate] = useState("");
    const [searchAccountCode, setSearchAccountCode] = useState("");

    async function loadAccounts() {
      const res = await fetch("/api/admin/accounts", { cache: "no-store" });
      const data = await safeJson(res);
      setAccounts(data.accounts || []);
    }

    async function loadNarrationSuggestions() {
      const res = await fetch("/api/admin/cashbook/narrations", { cache: "no-store" });
      const data = await safeJson(res);
      setNarrationSuggestions(data.narrations || []);
    }

    async function loadLedger(code: string) {
      if (!code) {
        setVouchers([]);
        setOpening(0);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/cashbook?accountCode=${encodeURIComponent(code)}`, {
          cache: "no-store",
        });
        const data = await safeJson(res);
        setVouchers(data.vouchers || []);
        setOpening(data.opening || 0);
      } finally {
        setLoading(false);
      }
    }

    useEffect(() => {
      loadAccounts();
      loadNarrationSuggestions();
    }, []);

    useEffect(() => {
      loadLedger(cashBankCode);
    }, [cashBankCode]);

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
        return v.cashBankAccountCode === searchAccountCode || v.entries.some((e) => e.accountCode === searchAccountCode);
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

    function startEdit(v: CashVoucher) {
      setEditingId(v._id);
      setEditingOriginalNet(v.totalReceipt - v.totalPayment);
      setCashBankCode(v.cashBankAccountCode);
      setDate(v.date.slice(0, 10));
      setLines(
        v.entries.map((e) => ({
          accountCode: e.accountCode,
          narration: e.narration || "",
          receipt: e.receipt ? String(e.receipt) : "",
          payment: e.payment ? String(e.payment) : "",
        }))
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function cancelEdit() {
      setEditingId(null);
      setEditingOriginalNet(0);
      setLines([{ ...emptyLine }]);
      setDate(new Date().toISOString().slice(0, 10));
    }

    async function deleteVoucher(id: string) {
      const result = await Swal.fire({
        icon: "warning",
        title: "Delete this cash book entry?",
        showCancelButton: true,
        confirmButtonText: "Delete",
        confirmButtonColor: "#B3452C",
      });
      if (!result.isConfirmed) return;

      const res = await fetch(`/api/admin/cashbook/${id}`, { method: "DELETE" });
      if (res.ok) {
        if (editingId === id) cancelEdit();
        loadLedger(cashBankCode);
      } else {
        Swal.fire({ icon: "error", title: "Failed to delete entry" });
      }
    }

    const transactionReceipt = lines.reduce((s, l) => s + (Number(l.receipt) || 0), 0);
    const transactionPayment = lines.reduce((s, l) => s + (Number(l.payment) || 0), 0);
    const displayOpening = editingId ? opening - editingOriginalNet : opening;
    const closing = displayOpening + transactionReceipt - transactionPayment;

    async function handleSave(e: React.FormEvent) {
      e.preventDefault();

      if (!cashBankCode) {
        Swal.fire({ icon: "warning", title: "Select a Cash/Bank account first" });
        return;
      }
      const validLines = lines.filter((l) => l.accountCode && (Number(l.receipt) || Number(l.payment)));
      if (validLines.length === 0) {
        Swal.fire({ icon: "warning", title: "Add at least one entry with an amount" });
        return;
      }

      setSaving(true);
      try {
        const url = editingId ? `/api/admin/cashbook/${editingId}` : "/api/admin/cashbook";
        const method = editingId ? "PATCH" : "POST";

        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cashBankAccountCode: cashBankCode,
            date,
            entries: validLines.map((l) => ({
              accountCode: l.accountCode,
              narration: l.narration,
              receipt: Number(l.receipt) || 0,
              payment: Number(l.payment) || 0,
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
          title: editingId ? "Cash book entry updated" : "Cash book entry saved",
          timer: 1000,
          showConfirmButton: false,
        });
        cancelEdit();
        loadLedger(cashBankCode);
        loadNarrationSuggestions();
      } finally {
        setSaving(false);
      }
    }

    return (
      <main className="min-h-screen bg-paper">
        <AdminHeader />

        <div className="max-w-4xl mx-auto px-6 pb-16">
          <h1 className="font-display text-2xl font-bold text-ink mb-6">Cash Book</h1>

          <form onSubmit={handleSave} className="bg-white rounded-2xl border border-ink/10 p-6 mb-8">
            {editingId && (
              <div className="mb-4 text-xs font-medium text-primary bg-primary/10 rounded-lg px-3 py-2">
                Editing CB {vouchers.find((v) => v._id === editingId)?.serialNumber}
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <Field label="Cash / Bank account">
                <AccountPicker
                  required
                  disabled={!!editingId}
                  accounts={accounts}
                  value={cashBankCode}
                  onChange={setCashBankCode}
                  placeholder="Search cash/bank account…"
                />
              </Field>
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

            <div className="border border-ink/10 rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-ink/[0.03] text-ink/50 text-xs uppercase tracking-wide">
                  <tr>
                    <th className="text-left px-3 py-2 w-10">#</th>
                    <th className="text-left px-3 py-2">Account code</th>
                    <th className="text-left px-3 py-2">Narration</th>
                    <th className="text-right px-3 py-2 w-28">Receipt</th>
                    <th className="text-right px-3 py-2 w-28">Payment</th>
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
                          value={line.receipt}
                          onChange={(e) => updateLine(i, "receipt", e.target.value)}
                          className="input text-right"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          step="0.01"
                          value={line.payment}
                          onChange={(e) => updateLine(i, "payment", e.target.value)}
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

            <div className="mt-5 grid grid-cols-3 gap-4 text-sm bg-ink/[0.03] rounded-lg p-4">
              <TotalBox label="Opening" value={displayOpening} />
              <TotalBox label="Transaction" value={transactionReceipt - transactionPayment} />
              <TotalBox label="Closing" value={closing} />
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

          {cashBankCode && (
            <>
              <div className="bg-white rounded-2xl border border-ink/10 p-4 mb-3 flex flex-wrap items-center gap-3">
                <div className="flex rounded-lg border border-ink/15 overflow-hidden text-sm">
                  {(["serial", "date", "narration", "account"] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => changeSearchMode(mode)}
                      className={`px-3 py-1.5 whitespace-nowrap ${
                        searchMode === mode ? "bg-primary text-white" : "text-ink/70 hover:bg-ink/5"
                      }`}
                    >
                      {mode === "serial" ? "CB Wise" : mode === "date" ? "Date Wise" : mode === "narration" ? "Narration Wise" : "Account Wise"}
                    </button>
                  ))}
                </div>

                {searchMode === "serial" && (
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Search CB #…"
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
                  <button
                    type="button"
                    onClick={resetSearch}
                    className="text-xs text-ink/50 hover:text-ink/80 underline"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="bg-white rounded-2xl border border-ink/10 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-ink/[0.03] text-ink/50 text-xs uppercase tracking-wide">
                    <tr>
                      <th className="text-left px-5 py-3">Serial</th>
                      <th className="text-left px-5 py-3">Date</th>
                      <th className="text-right px-5 py-3">Receipt</th>
                      <th className="text-right px-5 py-3">Payment</th>
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
                          No entries yet for this account.
                        </td>
                      </tr>
                    ) : filteredVouchers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-5 py-8 text-center text-ink/40">
                          No entries match your search.
                        </td>
                      </tr>
                    ) : (
                      filteredVouchers.map((v) => (
                        <tr key={v._id} className={editingId === v._id ? "bg-primary/5" : undefined}>
                          <td className="px-5 py-3 font-medium text-ink">CB {v.serialNumber}</td>
                          <td className="px-5 py-3 text-ink/70">
                            {new Date(v.date).toLocaleDateString()}
                          </td>
                          <td className="px-5 py-3 text-right text-ink/70">{v.totalReceipt.toFixed(2)}</td>
                          <td className="px-5 py-3 text-right text-ink/70">{v.totalPayment.toFixed(2)}</td>
                          <td className="px-5 py-3 text-right space-x-2">
                            <button
                              onClick={() => startEdit(v)}
                              aria-label="Edit cash book entry"
                              title="Edit"
                              className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-primary/30 text-primary hover:bg-primary/5 transition-colors"
                            >
                              <FaPen size={12} />
                            </button>
                            <button
                              onClick={() => deleteVoucher(v._id)}
                              aria-label="Delete cash book entry"
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
            </>
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

  function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
      <div>
        <label className="block text-sm font-medium text-ink/80 mb-1">{label}</label>
        {children}
      </div>
    );
  }

  function TotalBox({ label, value }: { label: string; value: number }) {
    return (
      <div>
        <p className="text-xs text-ink/50 uppercase tracking-wide mb-1">{label}</p>
        <p className={`font-semibold ${value < 0 ? "text-danger" : "text-ink"}`}>{value.toFixed(2)}</p>
      </div>
    );
  }
