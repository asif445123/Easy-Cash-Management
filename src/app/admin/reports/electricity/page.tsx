"use client";

import { useEffect, useMemo, useState, Fragment } from "react";
import AdminHeader from "@/components/AdminHeader";
import { safeJson } from "@/lib/api-client";

interface Charge {
  label: string;
  amount: number;
}

interface BillRow {
  id: string;
  periodStart: string;
  periodEnd: string;
  billMonth?: number; // 0-11
  billYear?: number;
  withMotorUnits: number;
  withoutMotorUnits: number;
  totalUnits: number;
  daysInPeriod: number;
  charges: Charge[];
  totalCharges: number;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function labelForBill(b: BillRow): string {
  if (typeof b.billMonth === "number" && typeof b.billYear === "number") {
    return `${MONTHS[b.billMonth]} ${b.billYear}`;
  }
  const d = new Date(b.periodStart);
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

// Format a Date using LOCAL year/month/day (avoids the UTC shift that
// `toISOString().slice(0, 10)` introduces for timezones ahead of UTC).
function toLocalDateStr(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function firstOfMonth() {
  const d = new Date();
  return toLocalDateStr(new Date(d.getFullYear(), d.getMonth(), 1));
}

export default function ElectricityReportPage() {
  const [bills, setBills] = useState<BillRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Filter state — empty string = no filter on that side
  const [fromDate, setFromDate] = useState(firstOfMonth);
  const [toDate, setToDate] = useState(() => toLocalDateStr(new Date()));

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/admin/reports/electricity", { cache: "no-store" });
        const json = await safeJson(res);
        if (!res.ok) {
          setError(json.message || "Could not load the report.");
          return;
        }
        setBills(json.bills || []);
      } catch {
        setError("Could not reach the server.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Filter bills: keep any bill whose period [periodStart, periodEnd] overlaps
  // the filter range [fromDate, toDate]. Either bound may be missing.
  const filteredBills = useMemo(() => {
    if (!fromDate && !toDate) return bills;

    const fromTs = fromDate ? new Date(fromDate).getTime() : -Infinity;
    // include the entire "to" day
    const toTs = toDate ? new Date(toDate).getTime() + 24 * 60 * 60 * 1000 - 1 : Infinity;

    return bills.filter((b) => {
      const startTs = new Date(b.periodStart).getTime();
      const endTs = new Date(b.periodEnd).getTime();
      // overlap check
      return endTs >= fromTs && startTs <= toTs;
    });
  }, [bills, fromDate, toDate]);

  const totalUnitsOverall = filteredBills.reduce((s, b) => s + b.totalUnits, 0);
  const totalWithMotor = filteredBills.reduce((s, b) => s + b.withMotorUnits, 0);
  const totalWithoutMotor = filteredBills.reduce((s, b) => s + b.withoutMotorUnits, 0);
  const totalSpent = filteredBills.reduce((s, b) => s + b.totalCharges, 0);
  const overallPerUnit = totalUnitsOverall > 0 ? totalSpent / totalUnitsOverall : 0;

  const hasFilter = Boolean(fromDate || toDate);

  return (
    <main className="min-h-screen bg-paper">
      <AdminHeader />

      <div className="max-w-4xl mx-auto px-6 pb-16">
        <h1 className="font-display text-2xl font-bold text-ink mb-1">Electricity Bill Report</h1>
        <p className="text-sm text-ink/50 mb-6">
          Read-only — built from the meter readings and bills you've entered under Add Entry →
          Electricity Bill.
        </p>

        {/* Date range filter */}
        <div className="bg-white rounded-2xl border border-ink/10 p-4 mb-6 flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-xs font-semibold text-ink/60 mb-1">From</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="border border-ink/12 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/25"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink/60 mb-1">To</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="border border-ink/12 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/25"
            />
          </div>
          {hasFilter && (
            <button
              onClick={() => {
                setFromDate("");
                setToDate("");
              }}
              className="ml-auto px-4 py-2 rounded-lg border border-ink/15 text-ink/70 text-sm font-medium hover:bg-ink/5 transition-colors"
            >
              Clear filter
            </button>
          )}
        </div>

        {loading ? (
          <p className="text-ink/50 text-sm">Loading…</p>
        ) : error ? (
          <div className="bg-white rounded-2xl border border-danger/20 p-6 text-sm text-danger">
            {error}
          </div>
        ) : bills.length === 0 ? (
          <div className="bg-white rounded-2xl border border-ink/10 p-8 text-center text-ink/40 text-sm">
            No bills entered yet.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <StatCard label="Total units" value={totalUnitsOverall.toLocaleString()} />
              <StatCard label="With motor" value={totalWithMotor.toLocaleString()} />
              <StatCard label="Without motor" value={totalWithoutMotor.toLocaleString()} />
              <StatCard label="Rs per unit" value={overallPerUnit.toFixed(2)} />
            </div>

            {filteredBills.length === 0 ? (
              <div className="bg-white rounded-2xl border border-ink/10 p-8 text-center text-ink/40 text-sm">
                No bills match the selected date range.
              </div>
            ) : (
              <>
                <div className="bg-white rounded-2xl border border-ink/10 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-ink/[0.03] text-ink/50 text-xs uppercase tracking-wide">
                      <tr>
                        <th className="text-left px-5 py-3">Period</th>
                        <th className="text-right px-5 py-3">With motor</th>
                        <th className="text-right px-5 py-3">Without motor</th>
                        <th className="text-right px-5 py-3">Total units</th>
                        <th className="text-right px-5 py-3">Bill amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ink/5">
                      {filteredBills.map((b) => (
                        <Fragment key={b.id}>
                          <tr
                            onClick={() => setExpandedId(expandedId === b.id ? null : b.id)}
                            className="cursor-pointer hover:bg-ink/[0.02] transition-colors"
                          >
                            <td className="px-5 py-3 text-ink/80">{labelForBill(b)}</td>
                            <td className="px-5 py-3 text-right text-ink/70">{b.withMotorUnits}</td>
                            <td className="px-5 py-3 text-right text-ink/70">{b.withoutMotorUnits}</td>
                            <td className="px-5 py-3 text-right font-medium text-ink">{b.totalUnits}</td>
                            <td className="px-5 py-3 text-right font-medium text-ink">
                              Rs {b.totalCharges.toLocaleString()}
                            </td>
                          </tr>
                          {expandedId === b.id && (
                            <tr>
                              <td colSpan={5} className="px-5 py-4 bg-ink/[0.02]">
                                <div className="grid sm:grid-cols-2 gap-6">
                                  <div>
                                    <p className="text-xs uppercase tracking-wide text-ink/40 mb-2">
                                      Charges
                                    </p>
                                    <ul className="space-y-1">
                                      {b.charges.length === 0 ? (
                                        <li className="text-ink/40 text-sm">No charges entered.</li>
                                      ) : (
                                        b.charges.map((c, i) => (
                                          <li key={i} className="flex justify-between text-sm">
                                            <span className="text-ink/70">{c.label}</span>
                                            <span className="text-ink font-medium">
                                              Rs {c.amount.toLocaleString()}
                                            </span>
                                          </li>
                                        ))
                                      )}
                                      <li className="flex justify-between text-sm pt-1 border-t border-ink/10 font-semibold">
                                        <span className="text-ink">Total</span>
                                        <span className="text-ink">
                                          Rs {b.totalCharges.toLocaleString()}
                                        </span>
                                      </li>
                                    </ul>
                                  </div>
                                  <div>
                                    <p className="text-xs uppercase tracking-wide text-ink/40 mb-2">
                                      Usage
                                    </p>
                                    <dl className="space-y-1 text-sm">
                                      <Row label="Period" value={labelForBill(b)} />
                                      {/* <Row
                                        label="Period"
                                        value={`${new Date(
                                          b.periodStart
                                        ).toLocaleDateString()} – ${new Date(
                                          b.periodEnd
                                        ).toLocaleDateString()}`}
                                      /> */}
                                      <Row label="Days with readings" value={String(b.daysInPeriod)} />
                                      <Row label="With motor" value={`${b.withMotorUnits} units`} />
                                      <Row
                                        label="Without motor"
                                        value={`${b.withoutMotorUnits} units`}
                                      />
                                      <Row label="Total units" value={`${b.totalUnits} units`} />
                                      <Row
                                        label="Rs per unit"
                                        value={
                                          b.totalUnits > 0
                                            ? (b.totalCharges / b.totalUnits).toFixed(2)
                                            : "—"
                                        }
                                      />
                                    </dl>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-ink/40 mt-2">
                  Click a row to see its full charge breakdown{hasFilter ? " and exact period dates" : ""}.
                </p>
              </>
            )}
          </>
        )}
      </div>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-2xl border border-ink/10 p-4">
      <p className="text-xs uppercase tracking-widest text-ink/40 mb-1">{label}</p>
      <p className="font-display text-lg font-bold text-ink">{value}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-ink/60">{label}</dt>
      <dd className="text-ink font-medium">{value}</dd>
    </div>
  );
}
