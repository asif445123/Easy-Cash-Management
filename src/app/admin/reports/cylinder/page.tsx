"use client";

import { useEffect, useState, Fragment } from "react";
import AdminHeader from "@/components/AdminHeader";
import { safeJson } from "@/lib/api-client";

interface CylinderPurchaseRow {
  id: string;
  sr: number;
  date: string;
  amount: number;
  rate: number;
  quantity: number;
  daysSincePrevious: number | null;
  detail: {
    days: number;
    perDayCost: number;
    kgPerDay: number | null;
    nextDate: string | null;
  };
}

interface ReportData {
  totalKg: number;
  totalAmount: number;
  totalDays: number;
  overallPerDayCost: number;
  overallPerKgCost: number;
  averageKgPerDay: number | null;
  purchases: CylinderPurchaseRow[];
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

export default function CylinderReportPage() {
  const [from, setFrom] = useState(firstOfMonth);
  const [to, setTo] = useState(() => toLocalDateStr(new Date()));
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  async function loadReport() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/reports/cylinder?from=${from}&to=${to}`, {
        cache: "no-store",
      });
      const json = await safeJson(res);
      if (res.ok) {
        setData(json as ReportData);
      } else {
        setError(json.message || `Could not load the report (status ${res.status}).`);
      }
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to]);

  return (
    <main className="min-h-screen bg-paper">
      <AdminHeader />

      <div className="max-w-4xl mx-auto px-6 pb-16">
        <h1 className="font-display text-2xl font-bold text-ink mb-1">Cylinder Report</h1>
        <p className="text-sm text-ink/50 mb-6">
          Read-only — all data is entered on the Cylinder page (Enter Data → Cylinder).
        </p>

        <div className="bg-white rounded-2xl border border-ink/10 p-6 mb-8 grid sm:grid-cols-2 gap-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-ink/80 mb-1">From</label>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink/80 mb-1">To</label>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="input" />
          </div>
        </div>

        {loading ? (
          <p className="text-ink/50 text-sm mb-8">Loading…</p>
        ) : error ? (
          <div className="bg-danger/5 border border-danger/20 text-danger text-sm rounded-xl px-4 py-3 mb-8">
            {error}
          </div>
        ) : data ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <StatCard label="Total kg" value={`${data.totalKg.toFixed(2)} kg`} />
              <StatCard label="Total spent" value={`Rs ${data.totalAmount.toLocaleString()}`} />
              <StatCard label="Per day cost" value={`Rs ${data.overallPerDayCost.toFixed(0)}`} />
              <StatCard label="Per kg cost" value={`Rs ${data.overallPerKgCost.toFixed(2)}`} />
            </div>

            <div className="bg-white rounded-2xl border border-ink/10 p-5 mb-8">
              <h2 className="font-display font-semibold text-ink mb-1">Cylinder average</h2>
              <p className="text-2xl font-bold text-primary">
                {data.averageKgPerDay === null ? (
                  "—"
                ) : (
                  <>
                    {data.averageKgPerDay.toFixed(3)}{" "}
                    <span className="text-sm font-normal text-ink/50">kg / day</span>
                  </>
                )}
              </p>
              <p className="text-xs text-ink/40 mt-1">
                {data.averageKgPerDay === null
                  ? "Needs at least one purchase followed by a later purchase in this range."
                  : "Kg bought in each completed fill-up period ÷ the days in those periods."}
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-ink/10 overflow-hidden mb-8">
              <div className="px-5 py-4 border-b border-ink/10">
                <h2 className="font-display font-semibold text-ink">Cylinder purchases</h2>
                <p className="text-xs text-ink/40 mt-0.5">Click a row to see its detailed breakdown.</p>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-ink/[0.03] text-ink/50 text-xs uppercase tracking-wide">
                  <tr>
                    <th className="text-left px-5 py-2">Sr</th>
                    <th className="text-left px-5 py-2">Date</th>
                    <th className="text-right px-5 py-2">Amount</th>
                    <th className="text-right px-5 py-2">Quantity</th>
                    <th className="text-right px-5 py-2">Days since last fill-up</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/5">
                  {data.purchases.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center text-ink/40">
                        No cylinder entries in this range.
                      </td>
                    </tr>
                  ) : (
                    [...data.purchases].reverse().map((p) => (
                      <Fragment key={p.id}>
                        <tr
                          onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
                          className="cursor-pointer hover:bg-ink/[0.02] transition-colors"
                        >
                          <td className="px-5 py-3 text-ink/60">{p.sr}</td>
                          <td className="px-5 py-3 text-ink/70">{new Date(p.date).toLocaleDateString()}</td>
                          <td className="px-5 py-3 text-right text-ink">Rs {p.amount.toLocaleString()}</td>
                          <td className="px-5 py-3 text-right text-ink/70">{p.quantity.toFixed(2)} kg</td>
                          <td className="px-5 py-3 text-right text-ink/60">
                            {p.daysSincePrevious === null ? "—" : `${p.daysSincePrevious} days`}
                          </td>
                        </tr>
                        {expandedId === p.id && (
                          <tr className="bg-ink/[0.02]">
                            <td colSpan={5} className="px-5 py-4">
                              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-sm">
                                <DetailStat label="Period" value={`${p.detail.days} days`} />
                                <DetailStat label="Per day cost" value={`Rs ${p.detail.perDayCost.toFixed(0)}`} />
                                <DetailStat label="Rate" value={`Rs ${p.rate} / kg`} />
                                <DetailStat
                                  label="Kg per day"
                                  value={p.detail.kgPerDay === null ? "—" : `${p.detail.kgPerDay.toFixed(3)} kg`}
                                />
                                <DetailStat
                                  label="Next fill-up"
                                  value={p.detail.nextDate ? new Date(p.detail.nextDate).toLocaleDateString() : "—"}
                                />
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : null}
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

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-2xl border border-ink/10 p-4">
      <p className="text-xs uppercase tracking-widest text-ink/40 mb-1">{label}</p>
      <p className="font-display text-lg font-bold text-ink">{value}</p>
    </div>
  );
}

function DetailStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-ink/40 uppercase tracking-wide mb-0.5">{label}</p>
      <p className="font-semibold text-ink">{value}</p>
    </div>
  );
}
