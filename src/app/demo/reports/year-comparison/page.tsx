"use client";

import { Fragment } from "react";
import DemoPageShell from "@/components/demo/DemoPageShell";
import {
  YEARS_EXTENDED,
  demoIncomeAccountsYearlyExtended,
  demoExpenseAccountsYearlyExtended,
  type YearlyAccountRow,
} from "@/lib/demoYearWiseReport";

interface Comparison {
  value: number;
  diff: number;
  cmp: "INC" | "DEC" | "EQL";
  pct: string;
}

function compare(prev: number, curr: number): Comparison {
  const diff = curr - prev;
  const cmp: Comparison["cmp"] = diff === 0 ? "EQL" : diff > 0 ? "INC" : "DEC";
  let pct: string;
  if (prev === 0) {
    pct = diff === 0 ? "—" : "#DIV/0!";
  } else {
    const p = Math.round((diff / prev) * 100);
    pct = `${p >= 0 ? "+" : ""}${p}%`;
  }
  return { value: curr, diff, cmp, pct };
}

function CmpCells({ c }: { c: Comparison }) {
  const cmpColor = c.cmp === "INC" ? "text-primary" : c.cmp === "DEC" ? "text-red-600" : "text-blue-500";
  const pctColor = c.pct === "—" ? "text-ink/30" : c.pct === "#DIV/0!" ? "text-orange-500" : c.pct.startsWith("-") ? "text-red-600" : "text-primary";
  return (
    <>
      <td className="px-2 py-2 text-right text-blue-500">{c.diff.toLocaleString("en-PK")}</td>
      <td className={`px-2 py-2 text-right ${cmpColor}`}>{c.cmp}</td>
      <td className={`px-2 py-2 text-right ${pctColor}`}>{c.pct}</td>
    </>
  );
}

function AccountTable({ title, accounts, tone }: { title: string; accounts: YearlyAccountRow[]; tone: "green" | "rose" }) {
  const totals: Record<number, number> = {};
  YEARS_EXTENDED.forEach((y) => {
    totals[y] = accounts.reduce((sum, a) => sum + a.values[y], 0);
  });

  return (
    <div className="bg-white rounded-2xl border border-ink/10 shadow-sm p-5 mb-5">
      <h2 className="font-semibold text-ink mb-3">{title}</h2>
      <div className="overflow-x-auto">
        <table className="text-sm min-w-max">
          <thead>
            <tr className="bg-ink/5 text-xs uppercase tracking-wide text-ink/50">
              <th rowSpan={2} className="px-3 py-2 text-left font-medium sticky left-0 bg-ink/5 align-bottom">
                Account
              </th>
              {YEARS_EXTENDED.map((y) => (
                <th key={y} colSpan={4} className="px-3 py-2 text-center font-medium border-l border-ink/10">
                  {y}
                </th>
              ))}
            </tr>
            <tr className="bg-ink/5 text-[10px] uppercase tracking-wide text-ink/40">
              {YEARS_EXTENDED.map((y) => (
                <Fragment key={y}>
                  <th className="px-2 py-1 text-right font-medium border-l border-ink/10">Expenses</th>
                  <th className="px-2 py-1 text-right font-medium">Diff</th>
                  <th className="px-2 py-1 text-right font-medium">Cmp</th>
                  <th className="px-2 py-1 text-right font-medium">%</th>
                </Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {accounts.map((row) => (
              <tr key={row.name} className="border-b border-ink/5 last:border-0">
                <td className="px-3 py-2 text-primary whitespace-nowrap sticky left-0 bg-white">{row.name}</td>
                {YEARS_EXTENDED.map((y, i) => {
                  const prevYear = i === 0 ? undefined : YEARS_EXTENDED[i - 1];
                  const prevVal = prevYear !== undefined ? row.values[prevYear] : 0;
                  const c = compare(prevVal, row.values[y]);
                  return (
                    <Fragment key={y}>
                      <td className="px-2 py-2 text-right border-l border-ink/10 text-ink/70">
                        {c.value === 0 ? "—" : c.value.toLocaleString("en-PK")}
                      </td>
                      <CmpCells c={c} />
                    </Fragment>
                  );
                })}
              </tr>
            ))}
            <tr className="bg-ink/5 font-semibold">
              <td className="px-3 py-2 sticky left-0 bg-ink/5">Total</td>
              {YEARS_EXTENDED.map((y, i) => {
                const prevYear = i === 0 ? undefined : YEARS_EXTENDED[i - 1];
                const prevVal = prevYear !== undefined ? totals[prevYear] : 0;
                const c = compare(prevVal, totals[y]);
                return (
                  <Fragment key={y}>
                    <td className={`px-2 py-2 text-right border-l border-ink/10 ${tone === "green" ? "text-primary" : "text-red-600"}`}>
                      {c.value.toLocaleString("en-PK")}
                    </td>
                    <CmpCells c={c} />
                  </Fragment>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function DemoYearComparisonPage() {
  return (
    <DemoPageShell title="Year Wise Comparison" description="Each year compared to the one right before it.">
      <div className="bg-white rounded-2xl border border-ink/10 shadow-sm p-5 mb-5 max-w-md">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-ink/70 mb-1">From year</label>
            <input
              type="text"
              value={YEARS_EXTENDED[0]}
              disabled
              readOnly
              title="Filters are illustrative in this demo"
              className="w-full px-3 py-2 rounded-lg border border-ink/15 bg-ink/[0.03] text-ink/70 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink/70 mb-1">To year</label>
            <input
              type="text"
              value={YEARS_EXTENDED[YEARS_EXTENDED.length - 1]}
              disabled
              readOnly
              title="Filters are illustrative in this demo"
              className="w-full px-3 py-2 rounded-lg border border-ink/15 bg-ink/[0.03] text-ink/70 cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      <AccountTable title="Income" accounts={demoIncomeAccountsYearlyExtended} tone="green" />
      <AccountTable title="Expenses" accounts={demoExpenseAccountsYearlyExtended} tone="rose" />
    </DemoPageShell>
  );
}
