export interface DemoNavItem {
  label: string;
  href: string;
}

// Drop these into your header wherever <DemoMenu items={...} /> is rendered.
export const demoAddEntryItems: DemoNavItem[] = [
  { label: "Account Types", href: "/demo/account-types" },
  { label: "Accounts Master File", href: "/demo/accounts-master" },
  { label: "Cash Book", href: "/demo/cash-book" },
  { label: "Journal Voucher", href: "/demo/journal-voucher" },
  { label: "Motorcycle", href: "/demo/motorcycle" },
  { label: "Electricity Bill", href: "/demo/electricity-bill" },
];

export const demoReportItems: DemoNavItem[] = [
  { label: "Accounts List", href: "/demo/reports/accounts-list" },
  { label: "Journal Voucher Report", href: "/demo/reports/journal-voucher" },
  { label: "Cash / Bank Book", href: "/demo/reports/cash-bank-book" },
  { label: "Account Ledger", href: "/demo/reports/account-ledger" },
  { label: "Accounts Receivable / Payable", href: "/demo/reports/receivable-payable" },
  { label: "Trial Balance (2 Column)", href: "/demo/reports/trial-balance-2" },
  { label: "Trial Balance (6 Column)", href: "/demo/reports/trial-balance-6" },
  { label: "Motorcycle Report", href: "/demo/reports/motorcycle" },
  { label: "Electricity Bill Report", href: "/demo/reports/electricity-bill" },
  { label: "Month Wise Report", href: "/demo/reports/month-wise" },
  { label: "Month Wise Comparison", href: "/demo/reports/month-comparison" },
  { label: "Year Wise Report", href: "/demo/reports/year-wise" },
  { label: "Year Wise Comparison", href: "/demo/reports/year-comparison" },
];
