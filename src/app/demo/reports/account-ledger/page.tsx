"use client";

import DemoPageShell from "@/components/demo/DemoPageShell";
import DemoFilterBar from "@/components/demo/DemoFilterBar";
import { demoAccountLedgerDetail } from "@/lib/demoAccountLedgerDetail";
import { fmtRs } from "@/lib/demoFormat";

export default function DemoAccountLedgerPage() {
  const d = demoAccountLedgerDetail;

  return (
    <DemoPageShell title="Account Ledger">
      <DemoFilterBar
        fields={[
          { label: "Account Type", value: d.accountType },
          { label: "Account Code", value: "All accounts (in type)" },
          { label: "To Code", value: "Same as Account Code" },
          { label: "Description", value: "" },
          { label: "From", value: d.from },
          { label: "To", value: d.to },
        ]}
      />

      <div className="bg-white rounded-2xl border border-ink/10 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-ink/10">
          <span className="font-medium text-ink">{d.accountLabel}</span>
          <div className="flex gap-6 text-sm">
            <span>
              <span className="text-ink/50">Opening: </span>
              <span className="font-semibold text-ink">{fmtRs(d.opening)}</span>
            </span>
            <span>
              <span className="text-ink/50">Closing: </span>
              <span className="font-semibold text-ink">{fmtRs(d.closing)}</span>
            </span>
          </div>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="bg-ink/5 text-xs uppercase tracking-wide text-ink/50">
              <th className="px-4 py-3 text-left font-medium">Date</th>
              <th className="px-4 py-3 text-left font-medium">Ref / Narration</th>
              <th className="px-4 py-3 text-right font-medium">Debit</th>
              <th className="px-4 py-3 text-right font-medium">Credit</th>
              <th className="px-4 py-3 text-right font-medium">Balance</th>
            </tr>
          </thead>
          <tbody>
            {d.rows.map((row, i) => (
              <tr key={i} className="border-b border-ink/5 last:border-0 hover:bg-ink/[0.02]">
                <td className="px-4 py-3 whitespace-nowrap align-top">{row.date}</td>
                <td className="px-4 py-3 text-ink/70">{row.ref}</td>
                <td className="px-4 py-3 text-right whitespace-nowrap align-top">{row.debit === 0 ? "0.00" : fmtRs(row.debit)}</td>
                <td className="px-4 py-3 text-right whitespace-nowrap align-top">{row.credit === 0 ? "0.00" : fmtRs(row.credit)}</td>
                <td className="px-4 py-3 text-right whitespace-nowrap align-top font-medium text-ink">{fmtRs(row.balance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DemoPageShell>
  );
}
