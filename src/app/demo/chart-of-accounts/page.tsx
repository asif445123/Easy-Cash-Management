import DemoPageShell from "@/components/demo/DemoPageShell";
import { demoAccountsMaster, demoAccountTypes } from "@/lib/demoData";
import { buildChartOfAccounts, type RawAccount, type RawAccountType } from "@/lib/chartOfAccounts";

/** 1234.5 -> "1,234.50"; zero -> "—" */
function fmt(value: number): string {
  if (!value) return "—";
  return value.toLocaleString("en-PK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

const demoTypes: RawAccountType[] = demoAccountTypes.map((t) => ({
  type: t.type,
  serial: t.serial,
}));

const demoAccounts: RawAccount[] = demoAccountsMaster.map((a) => ({
  _id: `${a.code}-${a.description}`,
  code: String(a.code),
  description: a.description,
  type: a.type,
  openingDebit: a.opDebit,
  openingCredit: a.opCredit,
}));

export default function DemoChartOfAccountsPage() {
  const classes = buildChartOfAccounts(demoTypes, demoAccounts);

  return (
    <DemoPageShell
      title="Chart of Accounts"
      description="Your whole chart of accounts at a glance — accounting head, account type and every account with its opening balance."
    >
      <div className="bg-white rounded-2xl border border-ink/10 overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead className="bg-ink/[0.03] text-ink/50 text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-4 py-3 w-[110px]">Code</th>
              <th className="text-left px-4 py-3">Account Name</th>
              <th className="text-center px-3 py-3 w-[60px]">Level</th>
              <th className="text-left px-4 py-3 w-[110px]">Type</th>
              <th className="text-left px-4 py-3 w-[150px]">Sub</th>
              <th className="text-right px-4 py-3 w-[130px]">Opening</th>
            </tr>
          </thead>
          <tbody>
            {classes.map((cls) => (
              <ClassRows key={cls.key} cls={cls} />
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-ink/45 mt-3">
        Level 1 is the accounting head, Level 2 the account type, Level 3 the account itself.
        Opening = opening debit − opening credit.
      </p>
    </DemoPageShell>
  );
}

function ClassRows({ cls }: { cls: ReturnType<typeof buildChartOfAccounts>[number] }) {
  return (
    <>
      <tr className="bg-ink/[0.045] border-t border-ink/10">
        <td className="px-4 py-2.5 font-bold text-ink">{cls.code}</td>
        <td className="px-4 py-2.5 font-bold text-ink">
          {cls.name}
          <span className="text-[11px] font-medium text-ink/40"> ({cls.accountCount})</span>
        </td>
        <td className="px-3 py-2.5 text-center font-semibold text-ink/70">{cls.level}</td>
        <td className="px-4 py-2.5 font-semibold text-ink/70">{cls.typeLabel}</td>
        <td className="px-4 py-2.5" />
        <td className="px-4 py-2.5 text-right font-bold text-ink">{fmt(cls.opening)}</td>
      </tr>

      {cls.types.map((group) => (
        <DemoTypeRows key={group.key} group={group} />
      ))}
    </>
  );
}

function DemoTypeRows({
  group,
}: {
  group: ReturnType<typeof buildChartOfAccounts>[number]["types"][number];
}) {
  return (
    <>
      <tr className="bg-ink/[0.015] border-t border-ink/5">
        <td className="px-4 py-2 font-semibold text-ink/80">{group.code}</td>
        <td className="px-4 py-2 pl-8 font-semibold text-ink/85">{group.name}</td>
        <td className="px-3 py-2 text-center text-ink/60">{group.level}</td>
        <td className="px-4 py-2 text-ink/60">{group.typeLabel}</td>
        <td className="px-4 py-2" />
        <td className="px-4 py-2 text-right font-semibold text-ink/80">{fmt(group.opening)}</td>
      </tr>

      {group.accounts.length === 0 ? (
        <tr className="border-t border-ink/5">
          <td colSpan={6} className="px-4 py-2 pl-12 text-xs italic text-ink/35">
            No accounts in this type yet.
          </td>
        </tr>
      ) : (
        group.accounts.map((a) => (
          <tr key={a.key} className="border-t border-ink/5 hover:bg-primary-light/40 transition-colors">
            <td className="px-4 py-2 pl-10 text-ink/70">{a.code}</td>
            <td className="px-4 py-2 pl-12 text-ink">{a.name}</td>
            <td className="px-3 py-2 text-center text-ink/50">{a.level}</td>
            <td className="px-4 py-2 text-ink/60">{a.typeLabel}</td>
            <td className="px-4 py-2 text-ink/60">{a.sub}</td>
            <td className="px-4 py-2 text-right text-ink/80">{fmt(a.opening)}</td>
          </tr>
        ))
      )}
    </>
  );
}
