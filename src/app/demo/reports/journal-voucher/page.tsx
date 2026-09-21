"use client";

import DemoPageShell from "@/components/demo/DemoPageShell";
import DemoFilterBar from "@/components/demo/DemoFilterBar";
import {
  demoJournalVoucherReport,
  demoJournalVoucherReportFrom,
  demoJournalVoucherReportTo,
} from "@/lib/demoJournalVoucherReport";
import { fmtRs } from "@/lib/demoFormat";

export default function DemoJournalVoucherReportPage() {
  const totalDebit = demoJournalVoucherReport.reduce((sum, r) => sum + r.debit, 0);
  const totalCredit = demoJournalVoucherReport.reduce((sum, r) => sum + r.credit, 0);

  return (
    <DemoPageShell title="Journal Voucher Report">
      <DemoFilterBar
        fields={[
          { label: "From", value: demoJournalVoucherReportFrom },
          { label: "To", value: demoJournalVoucherReportTo },
        ]}
        toggle={{ options: ["Date wise", "Month wise"], active: "Date wise" }}
        compareLabel="Compare with another period"
      />

      <div className="bg-white rounded-2xl border border-ink/10 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-ink/5 text-xs uppercase tracking-wide text-ink/50">
              <th className="px-4 py-3 text-left font-medium">Date</th>
              <th className="px-4 py-3 text-left font-medium">Serial</th>
              <th className="px-4 py-3 text-right font-medium">Debit</th>
              <th className="px-4 py-3 text-right font-medium">Credit</th>
            </tr>
          </thead>
          <tbody>
            {demoJournalVoucherReport.map((row) => (
              <tr key={row.serial} className="border-b border-ink/5 last:border-0 hover:bg-ink/[0.02]">
                <td className="px-4 py-3">{row.date}</td>
                <td className="px-4 py-3">{row.serial}</td>
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
