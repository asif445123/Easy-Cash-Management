"use client";

import DemoPageShell from "@/components/demo/DemoPageShell";
import DemoFilterBar from "@/components/demo/DemoFilterBar";
import { demoTrialBalance2Full, demoTrialBalance2AsOf } from "@/lib/demoTrialBalance2";
import { fmtRs } from "@/lib/demoFormat";

export default function DemoTrialBalance2Page() {
  const totalDebit = demoTrialBalance2Full.reduce((sum, r) => sum + (r.debit ?? 0), 0);
  const totalCredit = demoTrialBalance2Full.reduce((sum, r) => sum + (r.credit ?? 0), 0);

  return (
    <DemoPageShell title="Trial Balance (2 Column)">
      <DemoFilterBar
        fields={[
          { label: "Type", value: "All types" },
          { label: "As of date", value: demoTrialBalance2AsOf },
        ]}
        compareLabel="Compare with another date"
      />

      <div className="bg-white rounded-2xl border border-ink/10 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-ink/5 text-xs uppercase tracking-wide text-ink/50">
              <th className="px-4 py-3 text-left font-medium">Code</th>
              <th className="px-4 py-3 text-left font-medium">Description</th>
              <th className="px-4 py-3 text-right font-medium">Debit</th>
              <th className="px-4 py-3 text-right font-medium">Credit</th>
            </tr>
          </thead>
          <tbody>
            {demoTrialBalance2Full.map((row) => (
              <tr key={row.code} className="border-b border-ink/5 last:border-0 hover:bg-ink/[0.02]">
                <td className="px-4 py-3">{row.code}</td>
                <td className="px-4 py-3 text-primary">{row.description}</td>
                <td className="px-4 py-3 text-right">{fmtRs(row.debit)}</td>
                <td className="px-4 py-3 text-right">{fmtRs(row.credit)}</td>
              </tr>
            ))}
            <tr className="bg-ink/5 font-semibold">
              <td className="px-4 py-3" colSpan={2}>
                Total
              </td>
              <td className="px-4 py-3 text-right text-ink">{fmtRs(totalDebit)}</td>
              <td className="px-4 py-3 text-right text-ink">{fmtRs(totalCredit)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </DemoPageShell>
  );
}
