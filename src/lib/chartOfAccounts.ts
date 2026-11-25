/**
 * Chart of Accounts helpers.
 *
 * The app stores a *flat* list of accounts: every account has a free-form
 * code, a description and an Account Type (Cash, Bank, Accounts Receivable,
 * Expenses, ...). There is no stored parent/child hierarchy, so the Chart of
 * Accounts screen builds a three-level tree out of the data that already
 * exists:
 *
 *   Level 1 — the accounting class (Assets, Liabilities, Equity, Income,
 *             Expenses, Other) that a type belongs to
 *   Level 2 — the Account Type itself (Cash, Bank, Accounts Receivable, ...)
 *   Level 3 — the individual accounts inside that type
 *
 * A type's class is worked out from the flags set on Account Types
 * (Income / Expense / Cash-Bank) and, when no flag applies, from keywords in
 * the type name (e.g. "Accounts Payable" → Liability). Anything that matches
 * nothing lands in "Other Accounts" rather than being silently guessed into
 * the wrong side of the balance sheet.
 */

export type AccountClass = "Asset" | "Liability" | "Equity" | "Income" | "Expense" | "Other";

export interface RawAccountType {
  type: string;
  serial?: number;
  isIncomeType?: boolean;
  isExpenseType?: boolean;
  isCashBankType?: boolean;
  showInReceivablePayableList?: boolean;
}

export interface RawAccount {
  _id: string;
  code: string;
  description: string;
  type: string;
  openingDebit?: number;
  openingCredit?: number;
}

export interface ChartAccountRow {
  key: string;
  /** The account's own code, exactly as entered in Accounts Master File. */
  code: string;
  name: string;
  level: 3;
  /** Accounting class this account rolls up to. */
  typeLabel: string;
  /** Account Type name (Cash, Bank, ...) — shown in the "Sub" column. */
  sub: string;
  /** Signed opening balance: debit − credit. */
  opening: number;
}

export interface ChartTypeGroup {
  key: string;
  /** Generated group code, e.g. "11" = class 1, first type. */
  code: string;
  name: string;
  level: 2;
  typeLabel: string;
  opening: number;
  accounts: ChartAccountRow[];
}

export interface ChartClassGroup {
  key: string;
  /** Generated group code, e.g. "1". */
  code: string;
  name: string;
  level: 1;
  typeLabel: string;
  opening: number;
  types: ChartTypeGroup[];
  accountCount: number;
}

export const CLASS_ORDER: { cls: AccountClass; name: string; typeLabel: string; code: string }[] = [
  { cls: "Asset", name: "Assets", typeLabel: "Asset", code: "1" },
  { cls: "Liability", name: "Liabilities", typeLabel: "Liability", code: "2" },
  { cls: "Equity", name: "Equity", typeLabel: "Equity", code: "3" },
  { cls: "Income", name: "Income", typeLabel: "Income", code: "4" },
  { cls: "Expense", name: "Expenses", typeLabel: "Expenses", code: "5" },
  { cls: "Other", name: "Other Accounts", typeLabel: "Other", code: "9" },
];

const CLASS_META = new Map(CLASS_ORDER.map((c) => [c.cls, c]));

/** Opening balance of a single account, debit-positive. */
export function openingBalance(account: RawAccount): number {
  return (account.openingDebit || 0) - (account.openingCredit || 0);
}

/**
 * Works out which side of the chart an Account Type belongs to.
 * Order matters: explicit flags win, then name keywords.
 */
export function classifyAccountType(t: RawAccountType): AccountClass {
  const name = (t.type || "").toLowerCase();
  const has = (...words: string[]) => words.some((w) => name.includes(w));

  // 1. Flags the user set on Account Types
  if (t.isIncomeType) return "Income";
  if (t.isExpenseType) return "Expense";
  if (t.isCashBankType) return "Asset";

  // 2. Receivable / payable are the most specific name matches, so they are
  //    checked before the broader "account" style keywords.
  if (has("receivable", "debtor", "customer")) return "Asset";
  if (has("payable", "creditor", "supplier", "loan", "liabilit", "borrow")) return "Liability";

  // 3. Equity / profit-and-loss summary types
  if (has("equity", "capital", "retained", "profit", "loss", "drawing")) return "Equity";

  // 4. Assets
  if (
    has("cash", "bank", "asset", "inventory", "stock", "furniture", "building", "vehicle", "equipment", "deposit")
  ) {
    return "Asset";
  }

  // 5. Income
  if (has("income", "revenue", "sale", "compensation", "fee", "receipt")) return "Income";

  // 6. Expenses
  if (
    has("expense", "expenditure", "cost", "salary", "wage", "rent", "utility", "bill", "fuel", "petrol", "repair", "maintenance")
  ) {
    return "Expense";
  }

  return "Other";
}

/** Code-aware sort so "2" comes before "11" and "102001" before "102002". */
export function compareCodes(a: string, b: string): number {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
}

/**
 * Builds the whole tree: class → account type → accounts.
 * Types with no accounts still appear (so an empty type is visible), but
 * completely empty classes are dropped.
 */
export function buildChartOfAccounts(
  accountTypes: RawAccountType[],
  accounts: RawAccount[]
): ChartClassGroup[] {
  const typeNames = new Set(accountTypes.map((t) => t.type));

  // Accounts whose type no longer exists still need to show up somewhere,
  // otherwise they would silently vanish from the chart.
  accounts.forEach((a) => {
    if (!typeNames.has(a.type)) {
      typeNames.add(a.type);
      accountTypes = [...accountTypes, { type: a.type }];
    }
  });

  const byClass = new Map<AccountClass, RawAccountType[]>();
  CLASS_ORDER.forEach((c) => byClass.set(c.cls, []));

  [...accountTypes]
    .sort((a, b) => (a.serial ?? 0) - (b.serial ?? 0) || compareCodes(a.type, b.type))
    .forEach((t) => {
      const cls = classifyAccountType(t);
      byClass.get(cls)!.push(t);
    });

  const classes: ChartClassGroup[] = [];

  CLASS_ORDER.forEach((meta) => {
    const types = byClass.get(meta.cls) || [];
    const typeGroups: ChartTypeGroup[] = [];

    types.forEach((t, typeIndex) => {
      const rows: ChartAccountRow[] = accounts
        .filter((a) => a.type === t.type)
        .sort((a, b) => compareCodes(a.code, b.code))
        .map((a) => ({
          key: `acc-${a._id}`,
          code: a.code,
          name: a.description,
          level: 3,
          typeLabel: meta.typeLabel,
          sub: t.type,
          opening: openingBalance(a),
        }));

      typeGroups.push({
        key: `type-${meta.cls}-${typeIndex}`,
        code: `${meta.code}${typeIndex + 1}`,
        name: t.type,
        level: 2,
        typeLabel: meta.typeLabel,
        opening: rows.reduce((sum, r) => sum + r.opening, 0),
        accounts: rows,
      });
    });

    if (typeGroups.length === 0) return;

    classes.push({
      key: `class-${meta.cls}`,
      code: meta.code,
      name: meta.name,
      level: 1,
      typeLabel: meta.typeLabel,
      opening: typeGroups.reduce((sum, g) => sum + g.opening, 0),
      types: typeGroups,
      accountCount: typeGroups.reduce((sum, g) => sum + g.accounts.length, 0),
    });
  });

  return classes;
}

export function classMeta(cls: AccountClass) {
  return CLASS_META.get(cls) ?? CLASS_META.get("Other")!;
}
