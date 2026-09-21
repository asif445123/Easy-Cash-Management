"use client";

import DemoPageShell from "@/components/demo/DemoPageShell";
import DemoFilterBar from "@/components/demo/DemoFilterBar";
import DemoStatCard from "@/components/demo/DemoStatCard";
import DemoTable from "@/components/demo/DemoTable";
import { demoMotorcycle } from "@/lib/demoData";
import { fmtRs, fmtNum } from "@/lib/demoFormat";

function ChangeStatusCard({
  title,
  status,
}: {
  title: string;
  status: {
    last: number;
    current: number;
    limit: number;
    used: number;
    remaining: number;
    usedPct: number;
    duePct: number;
    lastEntryDaysAgo: number;
  };
}) {
  return (
    <div className="bg-white rounded-2xl border border-ink/10 shadow-sm p-5">
      <div className="font-semibold text-ink mb-3">{title}</div>

      <dl className="text-sm space-y-1.5 mb-3">
        <div className="flex justify-between">
          <dt className="text-ink/50">Last reading</dt>
          <dd className="font-semibold text-ink">{fmtNum(status.last)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-ink/50">Current reading</dt>
          <dd className="font-semibold text-ink">{fmtNum(status.current)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-ink/50">Limit</dt>
          <dd className="font-semibold text-ink">{fmtNum(status.limit)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-ink/50">How much running</dt>
          <dd className="font-semibold text-ink">{fmtNum(status.used)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-ink/50">Remaining</dt>
          <dd className="font-semibold text-ink">{fmtNum(status.remaining)}</dd>
        </div>
      </dl>

      <div className="w-full h-2 rounded-full bg-ink/10 overflow-hidden mb-2">
        <div className="h-full bg-primary" style={{ width: `${status.usedPct}%` }} />
      </div>

      <div className="flex justify-between text-xs text-ink/50 mb-1">
        <span>Used {status.usedPct}%</span>
        <span>Due {status.duePct}%</span>
      </div>

      <div className="text-xs text-ink/40">last entry {status.lastEntryDaysAgo} days ago</div>
    </div>
  );
}

export default function DemoMotorcycleReportPage() {
  const r = demoMotorcycle.report;

  return (
    <DemoPageShell title="Motorcycle Report" description="Read only — all data is entered on the Motorcycle (Add Entry) page.">
      <DemoFilterBar fields={[{ label: "From", value: r.from }, { label: "To", value: r.to }]} showPrint={false} />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <DemoStatCard label="Total KM" value={fmtNum(r.totalKm)} />
        <DemoStatCard label="Total Spent" value={fmtRs(r.totalSpent)} />
        <DemoStatCard label="Rs Per Liter (avg)" value={fmtRs(r.kmPerLPrice)} />
        <DemoStatCard label="Rs Per KM Cost" value={fmtRs(r.perKmCost)} />
      </div>

      <div className="bg-white rounded-2xl border border-ink/10 shadow-sm p-4 mb-5">
        <div className="text-xs uppercase tracking-wide text-ink/50 mb-1">Petrol average</div>
        <div className="text-lg font-bold text-primary">{r.petrolAvg} km / liter</div>
      </div>

      <div className="mb-2 text-sm font-semibold text-ink/70">Fuel purchases</div>
      <DemoTable
        keyField="date"
        columns={[
          { key: "date", label: "Date" },
          { key: "amount", label: "Amount", align: "right", render: (row) => fmtRs(row.amount) },
          { key: "quantity", label: "Quantity", align: "right", render: (row) => `${row.quantity} L` },
        ]}
        rows={demoMotorcycle.fuel}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
        <ChangeStatusCard title="Moblile Change Status" status={r.mobile} />
        <ChangeStatusCard title="Tuning Status" status={r.tuning} />
      </div>
    </DemoPageShell>
  );
}
