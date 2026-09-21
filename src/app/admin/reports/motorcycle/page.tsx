"use client";

import { useEffect, useState, Fragment } from "react";
import AdminHeader from "@/components/AdminHeader";
import { safeJson } from "@/lib/api-client";

interface FuelPurchaseRow {
  id: string;
  sr: number;
  date: string;
  amount: number;
  rate: number;
  quantity: number;
  daysSincePrevious: number | null;
  detail: {
    days: number;
    km: number;
    perDayCost: number;
    perKmCost: number;
    average: number;
    costPerKm: number;
  };
}

interface CategorySummary {
  lastReading: number;
  currentReading: number;
  lastDate: string | null;
  daysSinceLast: number | null;
  limit: number;
  changeAmount: number;
  running: number;
  remaining: number;
  percentUsed: number;
  percentDue: number;
}

interface ReportData {
  totalKm: number;
  totalLiters: number;
  totalAmount: number;
  totalDays: number;
  totalAverage: number;
  overallPerDayCost: number;
  overallPerKmCost: number;
  fuelPurchases: FuelPurchaseRow[];
  mobile: CategorySummary;
  tuning: CategorySummary;
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

// Converts a date into "N months and M days ago" once it's far enough back
// that a raw day count stops being readable at a glance (e.g. "64 days ago"
// → "2 months and 2 days ago"). Walks real calendar months — via lastDate,
// not the flat daysSinceLast count — so it correctly accounts for July
// having 31 days, February having 28/29, etc., instead of assuming every
// month is 30 days.
function formatDaysAgo(lastDateStr: string | null): string {
  if (!lastDateStr) return "";

  const last = new Date(lastDateStr);
  const today = new Date();
  last.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const totalDays = Math.round((today.getTime() - last.getTime()) / 86400000);
  if (totalDays <= 0) return "today";
  if (totalDays === 1) return "1 day ago";

  // Calendar-accurate months/days, same algorithm used for age calculators:
  // count whole months between the two dates, then whatever's left over is
  // real leftover days in whichever month we landed in.
  let months = (today.getFullYear() - last.getFullYear()) * 12 + (today.getMonth() - last.getMonth());
  let days = today.getDate() - last.getDate();

  if (days < 0) {
    months -= 1;
    const prevMonthLastDay = new Date(today.getFullYear(), today.getMonth(), 0).getDate();
    days += prevMonthLastDay;
  }

  // Under a month total — a plain day count reads better than "0 months and 12 days".
  if (months <= 0) return `${totalDays} days ago`;

  const monthPart = `${months} month${months === 1 ? "" : "s"}`;
  if (days === 0) return `${monthPart} ago`;

  const dayPart = `${days} day${days === 1 ? "" : "s"}`;
  return `${monthPart} and ${dayPart} ago`;
}

export default function MotorcycleReportPage() {
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
      const res = await fetch(`/api/admin/reports/motorcycle?from=${from}&to=${to}`, {
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
        <h1 className="font-display text-2xl font-bold text-ink mb-1">Motorcycle Report</h1>
        <p className="text-sm text-ink/50 mb-6">
          Read-only — all data is entered on the Motorcycle page (Add Entry → Motorcycle).
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
              <StatCard label="Total KM" value={`${data.totalKm.toLocaleString()} km`} />
              <StatCard label="Total spent" value={`Rs ${data.totalAmount.toLocaleString()}`} />
              <StatCard label="Per day cost" value={`Rs ${data.overallPerDayCost.toFixed(0)}`} />
              <StatCard label="Per km cost" value={`Rs ${data.overallPerKmCost.toFixed(2)}`} />
            </div>

            <div className="bg-white rounded-2xl border border-ink/10 p-5 mb-8">
              <h2 className="font-display font-semibold text-ink mb-1">Petrol average</h2>
              <p className="text-2xl font-bold text-primary">
                {data.totalAverage.toFixed(2)} <span className="text-sm font-normal text-ink/50">km / liter</span>
              </p>
              <p className="text-xs text-ink/40 mt-1">
                Total KM ÷ total liters purchased ({data.totalLiters.toFixed(2)} L) across this range.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-ink/10 overflow-hidden mb-8">
              <div className="px-5 py-4 border-b border-ink/10">
                <h2 className="font-display font-semibold text-ink">Fuel purchases</h2>
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
  {data.fuelPurchases.length === 0 ? (
    <tr>
      <td colSpan={5} className="px-5 py-8 text-center text-ink/40">
        No fuel entries in this range.
      </td>
    </tr>
  ) : (
    [...data.fuelPurchases].reverse().map((p) => (
      <Fragment key={p.id}>
        <tr
          onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
          className="cursor-pointer hover:bg-ink/[0.02] transition-colors"
        >
          <td className="px-5 py-3 text-ink/60">{p.sr}</td>
          <td className="px-5 py-3 text-ink/70">{new Date(p.date).toLocaleDateString()}</td>
          <td className="px-5 py-3 text-right text-ink">Rs {p.amount.toLocaleString()}</td>
          <td className="px-5 py-3 text-right text-ink/70">{p.quantity.toFixed(2)} L</td>
          <td className="px-5 py-3 text-right text-ink/60">
            {p.daysSincePrevious === null ? "—" : `${p.daysSincePrevious} days`}
          </td>
        </tr>
        {expandedId === p.id && (
          <tr className="bg-ink/[0.02]">
            <td colSpan={5} className="px-5 py-4">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-sm">
                <DetailStat label="Period" value={`${p.detail.days} days`} />
                <DetailStat label="KM in period" value={`${p.detail.km} km`} />
                <DetailStat label="Per day cost" value={`Rs ${p.detail.perDayCost.toFixed(0)}`} />
                <DetailStat label="Per km cost" value={`Rs ${p.detail.perKmCost.toFixed(2)}`} />
                <DetailStat label="Average" value={`${p.detail.average.toFixed(2)} km/L`} />
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

            <div className="grid sm:grid-cols-2 gap-6 mb-8">
              <LimitCard title="Moblile Change Status" data={data.mobile} />
              <LimitCard title="Tuning Status" data={data.tuning} />
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

function LimitCard({ title, data }: { title: string; data: CategorySummary }) {
  const overLimit = data.limit > 0 && data.currentReading > data.limit;
  return (
    <div className="bg-white rounded-2xl border border-ink/10 p-5">
      <h3 className="font-display font-semibold text-ink mb-3">{title}</h3>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="text-ink/60">Last reading</span>
        <span className="font-medium text-ink">{data.lastReading.toLocaleString()}</span>
      </div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="text-ink/60">Current reading</span>
        <span className="font-medium text-ink">{data.currentReading.toLocaleString()}</span>
      </div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="text-ink/60">Limit</span>
        <span className="font-medium text-ink">{data.limit.toLocaleString()}</span>
      </div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="text-ink/60">How much running</span>
        <span className="font-medium text-ink">{data.running.toLocaleString()}</span>
      </div>
      <div className="flex items-center justify-between text-sm mb-3">
        <span className="text-ink/60">Remaining</span>
        <span className={`font-medium ${overLimit ? "text-danger" : "text-ink"}`}>
          {data.remaining.toLocaleString()}
        </span>
      </div>
      <div className="w-full h-2 rounded-full bg-ink/10 overflow-hidden">
        <div
          className={`h-full ${overLimit ? "bg-danger" : "bg-primary"}`}
          style={{ width: `${Math.min(100, data.percentUsed)}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-xs text-ink/50 mt-1.5">
        <span>Used {data.percentUsed.toFixed(1)}%</span>
        <span>Due {data.percentDue.toFixed(1)}%</span>
      </div>
      {data.lastDate && (
        <p className="text-xs text-ink/40 mt-1">last entry {formatDaysAgo(data.lastDate)}</p>
      )}
    </div>
  );
}
