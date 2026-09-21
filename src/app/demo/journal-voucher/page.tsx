"use client";

import DemoPageShell from "@/components/demo/DemoPageShell";
import DemoEntryForm from "@/components/demo/DemoEntryForm";
import DemoTable from "@/components/demo/DemoTable";
import { demoJournalVoucherEntries } from "@/lib/demoData";
import { fmtRs } from "@/lib/demoFormat";

export default function DemoJournalVoucherPage() {
  return (
    <DemoPageShell
      title="Journal Voucher"
      description="Multi-line double-entry vouchers — every voucher's total debit must equal its total credit."
    >
      <DemoEntryForm
        saveLabel="Save voucher"
        note="A real voucher lets you add multiple debit/credit lines; this demo shows one sample line."
        fields={[
          { label: "Date", value: "17-Aug-2026" },
          { label: "Debit account", value: "24 — Motorcycle" },
          { label: "Credit account", value: "1 — Cash in Hand" },
          { label: "Amount", value: "60" },
        ]}
      />

      <DemoTable
        keyField="serial"
        columns={[
          { key: "serial", label: "Serial" },
          { key: "date", label: "Date" },
          { key: "debit", label: "Total Debit", align: "right", render: (r) => fmtRs(r.debit) },
          { key: "credit", label: "Total Credit", align: "right", render: (r) => fmtRs(r.credit) },
        ]}
        rows={demoJournalVoucherEntries}
      />
    </DemoPageShell>
  );
}
