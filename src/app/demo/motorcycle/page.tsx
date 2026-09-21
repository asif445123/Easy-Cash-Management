"use client";

import { useState } from "react";
import DemoPageShell from "@/components/demo/DemoPageShell";
import DemoTabs from "@/components/demo/DemoTabs";
import DemoEntryForm from "@/components/demo/DemoEntryForm";
import DemoTable from "@/components/demo/DemoTable";
import { demoMotorcycle } from "@/lib/demoData";
import { fmtRs, fmtNum } from "@/lib/demoFormat";

const TABS = ["Odometer", "Fuel purchases", "Mobile", "Tuning", "Set limits"];

export default function DemoMotorcyclePage() {
  const [tab, setTab] = useState("Odometer");

  return (
    <DemoPageShell
      title="Motorcycle"
      description="All motorcycle data — odometer readings, fuel purchases, mobile and tuning readings, and your spending limits — is entered here. The Motorcycle Report is read-only and just displays what's entered on this page."
    >
      <DemoTabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === "Odometer" && (
        <>
          <DemoEntryForm
            fields={[
              { label: "Date", value: "17-Aug-2026" },
              { label: "Odometer reading", value: "", placeholder: "e.g. 15680" },
              { label: "Note (optional)", value: "", placeholder: "Note" },
            ]}
          />
          <DemoTable
            keyField="date"
            columns={[
              { key: "date", label: "Date" },
              { key: "reading", label: "Reading", render: (r) => fmtNum(r.reading) },
              { key: "kmSince", label: "KM since last" },
              { key: "note", label: "Note" },
            ]}
            rows={demoMotorcycle.odometer}
          />
        </>
      )}

      {tab === "Fuel purchases" && (
        <>
          <DemoEntryForm
            fields={[
              { label: "Date", value: "17-Aug-2026" },
              { label: "Amount (Rs)", value: "", placeholder: "e.g. 2500" },
              { label: "Rate (Rs per liter)", value: "", placeholder: "e.g. 330" },
            ]}
          />
          <DemoTable
            keyField="date"
            columns={[
              { key: "date", label: "Date" },
              { key: "amount", label: "Amount", render: (r) => fmtRs(r.amount) },
              { key: "rate", label: "Rate", render: (r) => fmtRs(r.rate) },
              { key: "quantity", label: "Quantity", render: (r) => `${r.quantity} L` },
            ]}
            rows={demoMotorcycle.fuel}
          />
        </>
      )}

      {tab === "Mobile" && (
        <>
          <p className="text-sm text-ink/50 mb-3">
            Record the motorcycle's odometer reading at the moment you actually changed the mobile — the report
            compares this against the bike's current reading and your limit.
          </p>
          <DemoEntryForm fields={[{ label: "Date", value: "17-Aug-2026" }, { label: "Reading", value: "", placeholder: "e.g. 15649" }]} />
          <DemoTable
            keyField="date"
            columns={[
              { key: "date", label: "Date" },
              { key: "reading", label: "Reading", render: (r) => fmtNum(r.reading) },
            ]}
            rows={demoMotorcycle.mobile}
          />
        </>
      )}

      {tab === "Tuning" && (
        <>
          <p className="text-sm text-ink/50 mb-3">
            Record the motorcycle's odometer reading at the moment you actually changed the tuning — the report
            compares this against the bike's current reading and your limit.
          </p>
          <DemoEntryForm fields={[{ label: "Date", value: "17-Aug-2026" }, { label: "Reading", value: "", placeholder: "e.g. 11495" }]} />
          <DemoTable
            keyField="date"
            columns={[
              { key: "date", label: "Date" },
              { key: "reading", label: "Reading", render: (r) => fmtNum(r.reading) },
            ]}
            rows={demoMotorcycle.tuning}
          />
        </>
      )}

      {tab === "Set limits" && (
        <DemoEntryForm
          saveLabel="Save limits"
          fields={[
            { label: "Mobile limit (Rs)", value: String(demoMotorcycle.limits.mobileLimit) },
            { label: "Tuning limit (Rs)", value: String(demoMotorcycle.limits.tuningLimit) },
          ]}
        />
      )}
    </DemoPageShell>
  );
}
