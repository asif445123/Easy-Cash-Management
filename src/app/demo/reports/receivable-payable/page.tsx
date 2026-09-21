"use client";

import DemoPageShell from "@/components/demo/DemoPageShell";
import DemoFilterBar from "@/components/demo/DemoFilterBar";
import DemoTable from "@/components/demo/DemoTable";
import { demoReceivablePayable } from "@/lib/demoData";
import { fmtRs } from "@/lib/demoFormat";

export default function DemoReceivablePayablePage() {
  return (
    <DemoPageShell title="Accounts Receivable / Payable">
      <DemoFilterBar
        fields={[{ label: "As of date", value: "17-Aug-2026" }]}
        radioGroup={{ options: ["Receivable", "Payable", "All"], active: "All" }}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-semibold text-ink/70 mb-2">Receivable</h3>
          <DemoTable
            keyField="code"
            columns={[
              { key: "code", label: "Code" },
              { key: "description", label: "Description" },
              { key: "balance", label: "Balance", align: "right", render: (r) => fmtRs(r.balance) },
            ]}
            rows={[
              ...demoReceivablePayable.receivable,
              { code: "" as any, description: "Total", balance: demoReceivablePayable.receivableTotal },
            ]}
          />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-ink/70 mb-2">Payable</h3>
          <DemoTable
            keyField="code"
            columns={[
              { key: "code", label: "Code" },
              { key: "description", label: "Description" },
              { key: "balance", label: "Balance", align: "right", render: (r) => fmtRs(r.balance) },
            ]}
            rows={[
              ...demoReceivablePayable.payable,
              { code: "" as any, description: "Total", balance: demoReceivablePayable.payableTotal },
            ]}
          />
        </div>
      </div>
    </DemoPageShell>
  );
}
