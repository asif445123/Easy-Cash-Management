"use client";

import DemoPageShell from "@/components/demo/DemoPageShell";
import DemoFilterBar from "@/components/demo/DemoFilterBar";
import DemoTable from "@/components/demo/DemoTable";
import { demoAccountsListFull } from "@/lib/demoAccountsList";
import { fmtRs } from "@/lib/demoFormat";

export default function DemoAccountsListReportPage() {
  return (
    <DemoPageShell title="Accounts List">
      <DemoFilterBar fields={[{ label: "Type", value: "All types" }]} />

      <DemoTable
        keyField="code"
        columns={[
          { key: "code", label: "Code" },
          { key: "description", label: "Description" },
          { key: "type", label: "Type" },
          { key: "opDebit", label: "Op. Debit", align: "right", render: (r) => fmtRs(r.opDebit) },
          { key: "opCredit", label: "Op. Credit", align: "right", render: (r) => fmtRs(r.opCredit) },
        ]}
        rows={demoAccountsListFull}
      />
    </DemoPageShell>
  );
}
