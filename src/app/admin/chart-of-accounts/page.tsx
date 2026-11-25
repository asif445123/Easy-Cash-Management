"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { FaChevronDown, FaPrint, FaSearch, FaSitemap } from "react-icons/fa";
import AdminHeader from "@/components/AdminHeader";
import { safeJson } from "@/lib/api-client";
import {
  buildChartOfAccounts,
  type ChartClassGroup,
  type RawAccount,
  type RawAccountType,
} from "@/lib/chartOfAccounts";

/** 1234.5 -> "1,234.50"; zero -> "—" so empty openings don't shout. */
function fmt(value: number): string {
  if (!value) return "—";
  return value.toLocaleString("en-PK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Filters the tree down to rows matching a free-text search. */
function filterTree(classes: ChartClassGroup[], query: string): ChartClassGroup[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return classes;

  return classes
    .map((cls) => {
      const types = cls.types
        .map((t) => {
          const typeMatches = t.name.toLowerCase().includes(needle);
          const accounts = typeMatches
            ? t.accounts
            : t.accounts.filter(
                (a) =>
                  a.code.toLowerCase().includes(needle) || a.name.toLowerCase().includes(needle)
              );
          return { ...t, accounts };
        })
        .filter((t) => t.accounts.length > 0 || t.name.toLowerCase().includes(needle));

      return {
        ...cls,
        types,
        accountCount: types.reduce((sum, t) => sum + t.accounts.length, 0),
        opening: types.reduce((sum, t) => sum + t.opening, 0),
      };
    })
    .filter((cls) => cls.types.length > 0);
}

export default function ChartOfAccountsPage() {
  const [accountTypes, setAccountTypes] = useState<RawAccountType[]>([]);
  const [accounts, setAccounts] = useState<RawAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [typeRes, accRes] = await Promise.all([
          fetch("/api/admin/account-types", { cache: "no-store" }),
          fetch("/api/admin/accounts", { cache: "no-store" }),
        ]);
        const typeData = await safeJson(typeRes);
        const accData = await safeJson(accRes);

        if (cancelled) return;

        if (!typeRes.ok || !accRes.ok) {
          setError(
            typeData.message || accData.message || "Could not load your chart of accounts."
          );
          return;
        }

        setAccountTypes(typeData.accountTypes || []);
        setAccounts(accData.accounts || []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const tree = useMemo(
    () => buildChartOfAccounts(accountTypes, accounts),
    [accountTypes, accounts]
  );

  const visibleTree = useMemo(() => {
    const filtered = filterTree(tree, query);
    return classFilter === "all" ? filtered : filtered.filter((c) => c.name === classFilter);
  }, [tree, query, classFilter]);

  const totals = useMemo(() => {
    let debit = 0;
    let credit = 0;
    accounts.forEach((a) => {
      debit += a.openingDebit || 0;
      credit += a.openingCredit || 0;
    });
    return { debit, credit, count: tree.reduce((sum, c) => sum + c.accountCount, 0) };
  }, [accounts, tree]);

  function toggle(key: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  const classNames = tree.map((c) => c.name);

  return (
    <main className="min-h-screen bg-paper">
      <AdminHeader />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
        {/* Title */}
        <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-ink flex items-center gap-2">
              <FaSitemap size={18} className="text-primary" />
              Chart of Accounts
            </h1>
            <p className="text-sm text-ink/60 mt-1">
              Every account in your books, grouped by accounting head
              (Assets, Liabilities, Income, Expenses) and by Account Type —
              with its opening balance.
            </p>
          </div>

          <div className="flex items-center gap-2 print:hidden">
            <Link
              href="/admin/accounts"
              className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors"
            >
              Accounts Master File
            </Link>
            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-ink/15 text-ink text-sm font-semibold hover:bg-ink/5 transition-colors"
            >
              <FaPrint size={12} /> Print
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-ink/10 p-4 mb-5 flex flex-wrap items-end gap-4 print:hidden">
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="coa-search" className="block text-sm font-medium text-ink/80 mb-1">
              Search
            </label>
            <div className="relative">
              <FaSearch
                size={12}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/35 pointer-events-none"
              />
              <input
                id="coa-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Code, account name or type…"
                className="w-full border border-ink/15 rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          <div className="min-w-[180px]">
            <label htmlFor="coa-class" className="block text-sm font-medium text-ink/80 mb-1">
              Accounting head
            </label>
            <select
              id="coa-class"
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="w-full border border-ink/15 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="all">All heads</option>
              {classNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div className="text-xs text-ink/50 pb-2">
            {totals.count} account{totals.count === 1 ? "" : "s"} · Op. Dr{" "}
            <span className="font-semibold text-ink/70">{fmt(totals.debit)}</span> · Op. Cr{" "}
            <span className="font-semibold text-ink/70">{fmt(totals.credit)}</span>
          </div>
        </div>

        {error && (
          <div className="bg-danger/10 border border-danger/25 text-danger text-sm rounded-xl px-4 py-3 mb-5">
            {error}
          </div>
        )}

        {/* Tree table */}
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
              {loading && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-ink/40">
                    Loading chart of accounts…
                  </td>
                </tr>
              )}

              {!loading && visibleTree.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-ink/50">
                    {tree.length === 0 ? (
                      <>
                        No accounts yet. Create your{" "}
                        <Link href="/admin/account-types" className="text-primary font-medium underline">
                          Account Types
                        </Link>{" "}
                        first, then add accounts in the{" "}
                        <Link href="/admin/accounts" className="text-primary font-medium underline">
                          Accounts Master File
                        </Link>
                        .
                      </>
                    ) : (
                      "No accounts match your search."
                    )}
                  </td>
                </tr>
              )}

              {!loading &&
                visibleTree.map((cls) => {
                  const classCollapsed = collapsed.has(cls.key);
                  return (
                    <ClassRows
                      key={cls.key}
                      cls={cls}
                      collapsed={collapsed}
                      classCollapsed={classCollapsed}
                      onToggle={toggle}
                    />
                  );
                })}
            </tbody>

            {!loading && visibleTree.length > 0 && (
              <tfoot className="bg-ink/[0.03] font-semibold text-ink">
                <tr>
                  <td className="px-4 py-3" colSpan={5}>
                    Total opening balance
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-primary">{fmt(totals.debit)}</span>
                    <span className="text-ink/40"> / </span>
                    <span className="text-danger">{fmt(totals.credit)}</span>
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        <p className="text-xs text-ink/45 mt-3 leading-relaxed">
          Opening = opening debit − opening credit, so a negative figure is a credit balance.
          Levels are built from your own data: <strong>Level 1</strong> is the accounting head,
          <strong> Level 2</strong> is the Account Type and <strong>Level 3</strong> is the account
          itself. Change an account type&apos;s head by ticking Income / Expense / Cash-Bank on{" "}
          <Link href="/admin/account-types" className="text-primary underline">
            Account Types
          </Link>
          ; types that match no flag or keyword are listed under &ldquo;Other Accounts&rdquo;.
        </p>
      </div>
    </main>
  );
}

/** Renders one accounting head: its own row, then its type groups, then accounts. */
function ClassRows({
  cls,
  collapsed,
  classCollapsed,
  onToggle,
}: {
  cls: ChartClassGroup;
  collapsed: Set<string>;
  classCollapsed: boolean;
  onToggle: (key: string) => void;
}) {
  return (
    <>
      <tr className="bg-ink/[0.045] border-t border-ink/10">
        <td className="px-4 py-2.5 font-bold text-ink">{cls.code}</td>
        <td className="px-4 py-2.5 font-bold text-ink">
          <button
            type="button"
            onClick={() => onToggle(cls.key)}
            className="flex items-center gap-1.5 text-left"
            aria-expanded={!classCollapsed}
          >
            <FaChevronDown
              size={10}
              className={`text-ink/40 transition-transform print:hidden ${
                classCollapsed ? "-rotate-90" : ""
              }`}
            />
            {cls.name}
            <span className="text-[11px] font-medium text-ink/40">
              ({cls.accountCount})
            </span>
          </button>
        </td>
        <td className="px-3 py-2.5 text-center font-semibold text-ink/70">{cls.level}</td>
        <td className="px-4 py-2.5 font-semibold text-ink/70">{cls.typeLabel}</td>
        <td className="px-4 py-2.5" />
        <td className="px-4 py-2.5 text-right font-bold text-ink">{fmt(cls.opening)}</td>
      </tr>

      {!classCollapsed &&
        cls.types.map((group) => {
          const typeCollapsed = collapsed.has(group.key);
          return (
            <TypeRows
              key={group.key}
              group={group}
              typeCollapsed={typeCollapsed}
              onToggle={onToggle}
            />
          );
        })}
    </>
  );
}

function TypeRows({
  group,
  typeCollapsed,
  onToggle,
}: {
  group: ChartClassGroup["types"][number];
  typeCollapsed: boolean;
  onToggle: (key: string) => void;
}) {
  return (
    <>
      <tr className="bg-ink/[0.015] border-t border-ink/5">
        <td className="px-4 py-2 font-semibold text-ink/80">{group.code}</td>
        <td className="px-4 py-2 font-semibold text-ink/85">
          <button
            type="button"
            onClick={() => onToggle(group.key)}
            className="flex items-center gap-1.5 pl-4 text-left"
            aria-expanded={!typeCollapsed}
          >
            <FaChevronDown
              size={9}
              className={`text-ink/35 transition-transform print:hidden ${
                typeCollapsed ? "-rotate-90" : ""
              }`}
            />
            {group.name}
          </button>
        </td>
        <td className="px-3 py-2 text-center text-ink/60">{group.level}</td>
        <td className="px-4 py-2 text-ink/60">{group.typeLabel}</td>
        <td className="px-4 py-2" />
        <td className="px-4 py-2 text-right font-semibold text-ink/80">{fmt(group.opening)}</td>
      </tr>

      {!typeCollapsed &&
        (group.accounts.length === 0 ? (
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
        ))}
    </>
  );
}
