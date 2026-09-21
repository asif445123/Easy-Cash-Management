"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DemoPageShell from "@/components/demo/DemoPageShell";
import DemoTabs from "@/components/demo/DemoTabs";
import DemoTable from "@/components/demo/DemoTable";
import { promptCreateAccount } from "@/components/demo/promptCreateAccount";
import { demoElectricityBill } from "@/lib/demoData";
import { fmtRs, fmtNum } from "@/lib/demoFormat";

const TABS = ["Meter Reading", "Bill"];

export default function DemoElectricityBillPage() {
  const [tab, setTab] = useState("Meter Reading");
  const router = useRouter();

  return (
    <DemoPageShell
      title="Electricity Bill"
      description="Log daily meter readings here, and enter each bill (its exact period, plus every charge line item) when it arrives. The Electricity Bill Report is read-only and combines both."
    >
      <DemoTabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === "Meter Reading" && (
        <>
          <div className="bg-white rounded-2xl border border-ink/10 shadow-sm p-5 mb-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-ink/70 mb-1">Date</label>
                <input
                  type="text"
                  value="20-Aug-2026"
                  disabled
                  readOnly
                  className="w-full px-3 py-2 rounded-lg border border-ink/15 bg-ink/[0.03] text-ink/70 cursor-not-allowed"
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-ink/70 sm:mt-7">
                <input type="checkbox" disabled title="This is a read-only demo form" />
                With Motor
              </label>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-ink/70 mb-1">Meter reading</label>
              <input
                type="text"
                placeholder="e.g. 5908"
                disabled
                readOnly
                className="w-full px-3 py-2 rounded-lg border border-ink/15 bg-ink/[0.03] text-ink/70 cursor-not-allowed"
              />
            </div>
            <button
              onClick={() => promptCreateAccount(router, "Save")}
              className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors"
            >
              Save
            </button>
          </div>

          <DemoTable
            keyField="date"
            columns={[
              { key: "date", label: "Date" },
              { key: "reading", label: "Reading", align: "right", render: (r) => fmtNum(r.reading) },
              { key: "spread", label: "Unit spread", align: "right" },
              {
                key: "withMotor",
                label: "With Motor",
                align: "center",
                render: (r) => (r.withMotor ? <span className="text-primary">✓</span> : <span className="text-ink/30">—</span>),
              },
            ]}
            rows={demoElectricityBill.meterReadings}
          />
        </>
      )}

      {tab === "Bill" && (
        <>
          <div className="bg-white rounded-2xl border border-ink/10 shadow-sm p-5 mb-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-ink/70 mb-1">Bill month</label>
                <select disabled className="w-full px-3 py-2 rounded-lg border border-ink/15 bg-ink/[0.03] text-ink/70 cursor-not-allowed">
                  <option>August</option>
                </select>
                <p className="text-xs text-ink/40 mt-1">The month this bill represents.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-ink/70 mb-1">Bill year</label>
                <select disabled className="w-full px-3 py-2 rounded-lg border border-ink/15 bg-ink/[0.03] text-ink/70 cursor-not-allowed">
                  <option>2026</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-ink/70 mb-1">Period start</label>
                <input
                  type="text"
                  value="20 Aug 2026"
                  disabled
                  readOnly
                  className="w-full px-3 py-2 rounded-lg border border-ink/15 bg-ink/[0.03] text-ink/70 cursor-not-allowed"
                />
                <p className="text-xs text-ink/40 mt-1">The date of your meter reading that starts this bill.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-ink/70 mb-1">Period end</label>
                <input
                  type="text"
                  value="19 Sep 2026"
                  disabled
                  readOnly
                  className="w-full px-3 py-2 rounded-lg border border-ink/15 bg-ink/[0.03] text-ink/70 cursor-not-allowed"
                />
                <p className="text-xs text-ink/40 mt-1">
                  Auto-filled to one month later — adjust only if your billing cycle isn&apos;t exactly a month.
                </p>
              </div>
            </div>

            <div className="mb-2 text-sm font-medium text-ink/70">Charge</div>
            <div className="space-y-2 mb-3">
              {demoElectricityBill.billDefaultCharges.map((charge) => (
                <div key={charge} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={charge}
                    disabled
                    readOnly
                    className="flex-1 px-3 py-2 rounded-lg border border-ink/15 bg-ink/[0.03] text-ink/70 cursor-not-allowed"
                  />
                  <input
                    type="text"
                    placeholder="Rs 0"
                    disabled
                    readOnly
                    className="w-28 px-3 py-2 rounded-lg border border-ink/15 bg-ink/[0.03] text-ink/70 cursor-not-allowed"
                  />
                  <button
                    onClick={() => promptCreateAccount(router, "Remove charge")}
                    className="text-ink/30 hover:text-ink/60 px-1"
                    title="Remove"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-4 text-sm mb-4">
              <button onClick={() => promptCreateAccount(router, "Add charge")} className="text-primary font-medium hover:underline">
                + Add charge
              </button>
              <button onClick={() => promptCreateAccount(router, "Reset to default charges")} className="text-ink/50 hover:underline">
                Reset to default charges
              </button>
            </div>

            <div className="flex items-center justify-between px-1 py-2 mb-4 border-t border-ink/10 pt-3">
              <span className="text-ink/50 text-sm">Total</span>
              <span className="font-bold text-ink">Rs 0</span>
            </div>

            <button
              onClick={() => promptCreateAccount(router, "Save bill")}
              className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors"
            >
              Save
            </button>
          </div>

          <div className="mb-2 text-sm font-semibold text-ink/70">Past bills</div>
          <DemoTable
            keyField="month"
            columns={[
              { key: "month", label: "Month" },
              { key: "period", label: "Period" },
              { key: "units", label: "Units", align: "right", render: (r) => fmtNum(r.units) },
              { key: "amount", label: "Total Amount", align: "right", render: (r) => fmtRs(r.amount) },
            ]}
            rows={demoElectricityBill.billHistory}
          />
        </>
      )}
    </DemoPageShell>
  );
}
