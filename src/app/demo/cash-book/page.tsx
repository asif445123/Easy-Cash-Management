"use client";

import DemoPageShell from "@/components/demo/DemoPageShell";
import DemoEntryForm from "@/components/demo/DemoEntryForm";
import DemoTable from "@/components/demo/DemoTable";
import { demoCashBookRecent } from "@/lib/demoData";
import { fmtRs } from "@/lib/demoFormat";

export default function DemoCashBookPage() {
  return (
    <DemoPageShell
      title="Cash Book"
      description="Record cash or bank transactions against any account — each entry posts straight into the ledger and dashboard totals."
    >
      <DemoEntryForm
        note="Amounts, accounts, and dates are pre-filled with sample values in this demo."
        fields={[
          { label: "Date", value: "17-Aug-2026" },
          { label: "Account", value: "1 — Cash in Hand" },
          { label: "Narration", value: "Site Payment - Al Habib Plaza" },
          { label: "Debit", value: "150000" },
          { label: "Credit", value: "0" },
        ]}
      />

      <DemoTable
        keyField="date"
        columns={[
          { key: "date", label: "Date" },
          { key: "account", label: "Account" },
          { key: "narration", label: "Narration" },
          { key: "debit", label: "Debit", align: "right", render: (r) => fmtRs(r.debit) },
          { key: "credit", label: "Credit", align: "right", render: (r) => fmtRs(r.credit) },
        ]}
        rows={demoCashBookRecent}
      />
    </DemoPageShell>
  );
}
