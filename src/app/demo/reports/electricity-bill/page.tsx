"use client";

import { useRouter } from "next/navigation";
import DemoPageShell from "@/components/demo/DemoPageShell";
import DemoStatCard from "@/components/demo/DemoStatCard";
import { promptCreateAccount } from "@/components/demo/promptCreateAccount";
import { demoElectricityBillReport } from "@/lib/demoElectricityBillReport";
import { fmtRs, fmtNum } from "@/lib/demoFormat";

export default function DemoElectricityBillReportPage() {
  const router = useRouter();
  const r = demoElectricityBillReport;

  return (
    <DemoPageShell
      title="Electricity Bill Report"
      description="Read-only — built from the meter readings and bills you've entered under Add Entry → Electricity Bill."
    >
      <div className="bg-white rounded-2xl border border-ink/10 shadow-sm p-5 mb-5">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
            <div>
              <label className="block text-sm font-medium text-ink/70 mb-1">From</label>
              <input
                type="text"
                value={r.from}
                disabled
                readOnly
                title="Filters are illustrative in this demo"
                className="w-full px-3 py-2 rounded-lg border border-ink/15 bg-ink/[0.03] text-ink/70 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink/70 mb-1">To</label>
              <input
                type="text"
                value={r.to}
                disabled
                readOnly
                title="Filters are illustrative in this demo"
                className="w-full px-3 py-2 rounded-lg border border-ink/15 bg-ink/[0.03] text-ink/70 cursor-not-allowed"
              />
            </div>
          </div>
          <button
            onClick={() => promptCreateAccount(router, "Clear filter")}
            className="px-4 py-2 rounded-lg border border-ink/15 text-ink/70 text-sm font-medium hover:bg-ink/5 transition-colors"
          >
            Clear filter
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <DemoStatCard label="Total Units" value={fmtNum(r.totalUnits)} />
        <DemoStatCard label="With Motor" value={fmtNum(r.withMotor)} />
        <DemoStatCard label="Without Motor" value={fmtNum(r.withoutMotor)} />
        <DemoStatCard label="Rs Per Unit" value={fmtRs(r.rsPerUnit)} />
      </div>

      <div className="bg-white rounded-2xl border border-ink/10 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-ink/5 text-xs uppercase tracking-wide text-ink/50">
                <th className="px-4 py-3 text-left font-medium">Period</th>
                <th className="px-4 py-3 text-right font-medium">With Motor</th>
                <th className="px-4 py-3 text-right font-medium">Without Motor</th>
                <th className="px-4 py-3 text-right font-medium">Total Units</th>
                <th className="px-4 py-3 text-right font-medium">Bill Amount</th>
              </tr>
            </thead>
            <tbody>
              {r.periods.map((row) => (
                <tr
                  key={row.period}
                  onClick={() => promptCreateAccount(router, "View charge breakdown")}
                  className="border-b border-ink/5 last:border-0 hover:bg-ink/[0.03] cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 text-primary font-medium">{row.period}</td>
                  <td className="px-4 py-3 text-right">{fmtNum(row.withMotor)}</td>
                  <td className="px-4 py-3 text-right">{fmtNum(row.withoutMotor)}</td>
                  <td className="px-4 py-3 text-right font-semibold text-ink">{fmtNum(row.totalUnits)}</td>
                  <td className="px-4 py-3 text-right font-semibold text-ink">{fmtRs(row.billAmount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-ink/40 mt-2">Click a row to see its full charge breakdown and exact period dates.</p>
    </DemoPageShell>
  );
}
