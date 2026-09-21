"use client";

import DemoPageShell from "@/components/demo/DemoPageShell";
import DemoFilterBar from "@/components/demo/DemoFilterBar";
import { demoTrialBalance6Full, demoTrialBalance6From, demoTrialBalance6To } from "@/lib/demoTrialBalance6";
import { fmtRs } from "@/lib/demoFormat";

export default function DemoTrialBalance6Page() {
  const totals = demoTrialBalance6Full.reduce(
    (acc, r) => ({
      openDebit: acc.openDebit + (r.openDebit ?? 0),
      openCredit: acc.openCredit + (r.openCredit ?? 0),
      transDebit: acc.transDebit + (r.transDebit ?? 0),
      transCredit: acc.transCredit + (r.transCredit ?? 0),
      closeDebit: acc.closeDebit + (r.closeDebit ?? 0),
      closeCredit: acc.closeCredit + (r.closeCredit ?? 0),
    }),
    { openDebit: 0, openCredit: 0, transDebit: 0, transCredit: 0, closeDebit: 0, closeCredit: 0 }
  );

  return (
    <DemoPageShell title="Trial Balance (6 Column)">
      <DemoFilterBar
        fields={[
          { label: "Type", value: "All types" },
          { label: "From", value: demoTrialBalance6From },
          { label: "To", value: demoTrialBalance6To },
        ]}
        compareLabel="Compare with another period"
      />

      <div className="bg-white rounded-2xl border border-ink/10 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-ink/5 text-xs uppercase tracking-wide text-ink/50">
                <th rowSpan={2} className="px-4 py-2 text-left align-bottom">Code</th>
                <th rowSpan={2} className="px-4 py-2 text-left align-bottom">Description</th>
                <th colSpan={2} className="px-4 py-2 text-center border-l border-ink/10">Opening</th>
                <th colSpan={2} className="px-4 py-2 text-center border-l border-ink/10">Transaction</th>
                <th colSpan={2} className="px-4 py-2 text-center border-l border-ink/10">Closing</th>
              </tr>
              <tr className="bg-ink/5 text-xs uppercase tracking-wide text-ink/50">
                <th className="px-3 py-2 text-right border-l border-ink/10">Debit</th>
                <th className="px-3 py-2 text-right">Credit</th>
                <th className="px-3 py-2 text-right border-l border-ink/10">Debit</th>
                <th className="px-3 py-2 text-right">Credit</th>
                <th className="px-3 py-2 text-right border-l border-ink/10">Debit</th>
                <th className="px-3 py-2 text-right">Credit</th>
              </tr>
            </thead>
            <tbody>
              {demoTrialBalance6Full.map((row) => (
                <tr key={row.code} className="border-b border-ink/5 last:border-0 hover:bg-ink/[0.02]">
                  <td className="px-4 py-2">{row.code}</td>
                  <td className="px-4 py-2 text-primary whitespace-nowrap">{row.description}</td>
                  <td className="px-3 py-2 text-right border-l border-ink/10">{fmtRs(row.openDebit)}</td>
                  <td className="px-3 py-2 text-right">{fmtRs(row.openCredit)}</td>
                  <td className="px-3 py-2 text-right border-l border-ink/10">{fmtRs(row.transDebit)}</td>
                  <td className="px-3 py-2 text-right">{fmtRs(row.transCredit)}</td>
                  <td className="px-3 py-2 text-right border-l border-ink/10 font-medium">{fmtRs(row.closeDebit)}</td>
                  <td className="px-3 py-2 text-right font-medium">{fmtRs(row.closeCredit)}</td>
                </tr>
              ))}
              <tr className="bg-ink/5 font-semibold">
                <td className="px-4 py-2" colSpan={2}>Total</td>
                <td className="px-3 py-2 text-right border-l border-ink/10 text-ink">{fmtRs(totals.openDebit)}</td>
                <td className="px-3 py-2 text-right text-ink">{fmtRs(totals.openCredit)}</td>
                <td className="px-3 py-2 text-right border-l border-ink/10 text-ink">{fmtRs(totals.transDebit)}</td>
                <td className="px-3 py-2 text-right text-ink">{fmtRs(totals.transCredit)}</td>
                <td className="px-3 py-2 text-right border-l border-ink/10 text-ink">{fmtRs(totals.closeDebit)}</td>
                <td className="px-3 py-2 text-right text-ink">{fmtRs(totals.closeCredit)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </DemoPageShell>
  );
}
