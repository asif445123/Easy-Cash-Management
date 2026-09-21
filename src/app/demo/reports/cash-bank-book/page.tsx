"use client";

import DemoPageShell from "@/components/demo/DemoPageShell";
import DemoFilterBar from "@/components/demo/DemoFilterBar";
import DemoTable from "@/components/demo/DemoTable";
import { demoCashBankBook } from "@/lib/demoData";
import { fmtRs } from "@/lib/demoFormat";

export default function DemoCashBankBookPage() {
  return (
    <DemoPageShell title="Cash / Bank Book">
      <DemoFilterBar
        fields={[
          { label: "Account code", value: demoCashBankBook.accountLabel },
          { label: "Description", value: "Ume Iftakhar" },
          { label: "From", value: "31-Jul-2026" },
          { label: "To", value: "17-Aug-2026" },
        ]}
        toggle={{ options: ["Date wise", "Month wise"], active: "Date wise" }}
        compareLabel="Compare with another period"
      />

      <div className="flex gap-6 mb-4 text-sm">
        <div>
          <span className="text-ink/50">Opening: </span>
          <span className="font-semibold text-ink">{fmtRs(demoCashBankBook.opening)}</span>
        </div>
        <div>
          <span className="text-ink/50">Closing: </span>
          <span className="font-semibold text-ink">{fmtRs(demoCashBankBook.closing)}</span>
        </div>
      </div>

      <DemoTable
        keyField="date"
        columns={[
          { key: "date", label: "Date" },
          { key: "ref", label: "Ref / Narration" },
          { key: "debit", label: "Debit", align: "right", render: (r) => fmtRs(r.debit) },
          { key: "credit", label: "Credit", align: "right", render: (r) => fmtRs(r.credit) },
          { key: "balance", label: "Balance", align: "right", render: (r) => fmtRs(r.balance) },
        ]}
        rows={demoCashBankBook.rows}
      />
    </DemoPageShell>
  );
}
