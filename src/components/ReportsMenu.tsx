"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { FaChartBar, FaChevronDown } from "react-icons/fa";

const REPORT_LINKS = [
  { href: "/admin/reports/accounts-list", label: "Accounts List" },
  { href: "/admin/reports/journal-voucher", label: "Journal Voucher Report" },
  { href: "/admin/reports/cash-bank-book", label: "Cash / Bank Book" },
  { href: "/admin/reports/account-ledger", label: "Account Ledger" },
  { href: "/admin/reports/receivable-payable", label: "Accounts Receivable / Payable" },
  { href: "/admin/reports/trial-balance-2col", label: "Trial Balance (2 Column)" },
  { href: "/admin/reports/trial-balance-6col", label: "Trial Balance (6 Column)" },
  { href: "/admin/reports/month-wise", label: "Month Wise Report" },
  { href: "/admin/reports/month-wise-comparison", label: "Month Wise Comparison" },
  { href: "/admin/reports/year-wise", label: "Year Wise Report" },
  { href: "/admin/reports/year-wise-comparison", label: "Year Wise Comparison" },
  { href: "/admin/reports/motorcycle", label: "Motorcycle Report" },
  { href: "/admin/reports/electricity", label: "Electricity Bill Report" },
];

/** "Show Reports" navbar dropdown linking to the accounting report screens. */
export default function ReportsMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-ink/15 text-ink/80 text-sm font-medium hover:bg-ink/5 transition-colors"
      >
        <FaChartBar size={11} />
        Show Reports
        <FaChevronDown size={10} className={open ? "rotate-180 transition-transform" : "transition-transform"} />
      </button>

      {open && (
        <div className="absolute left-0 mt-2 w-64 bg-white rounded-xl border border-ink/10 shadow-lg py-1 z-20">
          {REPORT_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm text-ink/80 hover:bg-ink/5 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
