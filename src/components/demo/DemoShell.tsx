"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { FaBars, FaChevronDown, FaTimes } from "react-icons/fa";
import {
  AccountTypesIcon,
  AccountsMasterIcon,
  CashBookIcon,
  DashboardIcon,
  ElectricityIcon,
  JournalVoucherIcon,
  LogoutIcon,
  MotorcycleIcon,
  ReportItemIcon,
  ReportsIcon,
  UserApprovalsIcon,
} from "@/components/SidebarIcons";

const DEMO_ENTRY_NAV = [
  { href: "/demo/account-types", label: "Account Types", icon: AccountTypesIcon },
  { href: "/demo/accounts-master", label: "Accounts Master File", icon: AccountsMasterIcon },
  { href: "/demo/cash-book", label: "Cash Book", icon: CashBookIcon },
  { href: "/demo/journal-voucher", label: "Journal Voucher", icon: JournalVoucherIcon },
  { href: "/demo/motorcycle", label: "Motorcycle", icon: MotorcycleIcon },
  { href: "/demo/electricity-bill", label: "Electricity Bill", icon: ElectricityIcon },
];

const DEMO_REPORT_NAV = [
  { href: "/demo/reports/accounts-list", label: "Accounts List", kind: "accounts-list" },
  { href: "/demo/reports/journal-voucher", label: "Journal Voucher Report", kind: "journal-voucher" },
  { href: "/demo/reports/cash-bank-book", label: "Cash / Bank Book", kind: "cash-bank-book" },
  { href: "/demo/reports/account-ledger", label: "Account Ledger", kind: "account-ledger" },
  { href: "/demo/reports/receivable-payable", label: "Receivable / Payable", kind: "receivable-payable" },
  { href: "/demo/reports/trial-balance-2", label: "Trial Balance (2 Col)", kind: "trial-balance-2" },
  { href: "/demo/reports/trial-balance-6", label: "Trial Balance (6 Col)", kind: "trial-balance-6" },
  { href: "/demo/reports/motorcycle", label: "Motorcycle Report", kind: "motorcycle" },
  { href: "/demo/reports/electricity-bill", label: "Electricity Bill Report", kind: "electricity" },
  { href: "/demo/reports/month-wise", label: "Month Wise Report", kind: "month-wise" },
  { href: "/demo/reports/month-comparison", label: "Month Wise Comparison", kind: "month-comparison" },
  { href: "/demo/reports/year-wise", label: "Year Wise Report", kind: "year-wise" },
  { href: "/demo/reports/year-comparison", label: "Year Wise Comparison", kind: "year-comparison" },
];

export default function DemoShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const onReportRoute = pathname.startsWith("/demo/reports");
  const [reportsOpen, setReportsOpen] = useState(onReportRoute);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (pathname.startsWith("/demo/reports")) {
      setReportsOpen(true);
    }
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setMobileOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  async function handleDemoLogout() {
    setMobileOpen(false);
    const result = await Swal.fire({
      icon: "question",
      title: "Leave the demo?",
      showCancelButton: true,
      confirmButtonText: "Leave demo",
      confirmButtonColor: "#B3452C",
    });
    if (result.isConfirmed) {
      router.push("/");
    }
  }

  function isActive(href: string, exact = false) {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  }

  const linkClass = (active: boolean) =>
    `flex items-center gap-3 w-full px-4 py-2.5 text-sm transition-colors ${
      active
        ? "bg-[#2563EB] text-white font-medium"
        : "text-slate-200 hover:bg-white/[0.08] hover:text-white"
    }`;

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0F172A] text-white select-none">
      <div className="px-4 py-4 border-b border-white/10 flex items-center justify-between gap-2 shrink-0">
        <Link
          href="/demo"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-2.5 min-w-0"
        >
          <span className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-accent font-display font-bold shrink-0 shadow-sm">
            ₨
          </span>
          <div className="min-w-0">
            <span className="font-display font-bold text-base leading-tight tracking-tight text-white block truncate">
              EasyCash
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-amber-300 block">
              Demo Mode
            </span>
          </div>
        </Link>

        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          aria-label="Close sidebar"
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <FaTimes size={16} />
        </button>
      </div>

      <nav aria-label="Demo navigation" className="flex-1 overflow-y-auto py-2">
        <Link href="/demo" className={linkClass(isActive("/demo", true))}>
          <DashboardIcon className="w-5 h-5 shrink-0" />
          <span className="truncate">Demo Overview</span>
        </Link>

        <Link href="/demo/dashboard" className={linkClass(isActive("/demo/dashboard"))}>
          <DashboardIcon className="w-5 h-5 shrink-0" />
          <span className="truncate">Dashboard</span>
        </Link>

        {DEMO_ENTRY_NAV.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className={linkClass(isActive(item.href))}>
              <Icon className="w-5 h-5 shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}

        <div>
          <button
            type="button"
            onClick={() => setReportsOpen((o) => !o)}
            aria-expanded={reportsOpen}
            className={`flex items-center justify-between w-full px-4 py-2.5 text-sm transition-colors ${
              onReportRoute && !reportsOpen
                ? "bg-[#2563EB] text-white font-medium"
                : "text-slate-200 hover:bg-white/[0.08] hover:text-white"
            }`}
          >
            <span className="flex items-center gap-3 min-w-0">
              <ReportsIcon className="w-5 h-5 shrink-0" />
              <span className="truncate">Show Reports</span>
            </span>
            <FaChevronDown
              size={11}
              className={`shrink-0 text-slate-400 transition-transform duration-200 ${
                reportsOpen ? "rotate-180 text-white" : ""
              }`}
            />
          </button>

          {reportsOpen && (
            <div className="bg-[#0B1120] py-1 border-y border-white/5">
              {DEMO_REPORT_NAV.map((report) => {
                const active = isActive(report.href);
                return (
                  <Link
                    key={report.href}
                    href={report.href}
                    className={`flex items-center gap-2.5 pl-8 pr-4 py-2 text-[13px] transition-colors ${
                      active
                        ? "bg-[#2563EB] text-white font-medium"
                        : "text-slate-300 hover:bg-white/[0.07] hover:text-white"
                    }`}
                  >
                    <ReportItemIcon kind={report.kind} className="w-4 h-4 shrink-0" />
                    <span className="truncate">{report.label}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </nav>

      <div className="border-t border-white/10 p-3 space-y-2 shrink-0 bg-[#0B1120]">
        <Link
          href="/register"
          className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors"
        >
          <UserApprovalsIcon className="w-4 h-4 shrink-0" />
          <span>Create real account</span>
        </Link>
        <button
          type="button"
          onClick={handleDemoLogout}
          className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm text-rose-300 hover:bg-rose-500/15 hover:text-rose-200 transition-colors"
        >
          <LogoutIcon className="w-4 h-4 shrink-0" />
          <span>Log out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-paper">
      <aside className="hidden lg:block fixed inset-y-0 left-0 w-64 z-30 border-r border-white/10 print:hidden">
        {sidebarContent}
      </aside>

      <header className="lg:hidden sticky top-0 z-20 bg-[#0F172A] text-white px-4 py-3 flex items-center justify-between border-b border-white/10 print:hidden">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation menu"
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-white/15 text-slate-200 hover:bg-white/10 transition-colors shrink-0"
          >
            <FaBars size={16} />
          </button>
          <Link href="/demo" className="flex items-center gap-2 min-w-0">
            <span className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-accent font-display font-bold text-sm shrink-0">
              ₨
            </span>
            <span className="font-display font-bold text-base tracking-tight truncate">
              EasyCash Demo
            </span>
          </Link>
        </div>

        <Link
          href="/register"
          className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary-dark transition-colors shrink-0"
        >
          Sign up
        </Link>
      </header>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex print:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-[1px]"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <aside className="relative w-64 max-w-[82vw] h-full shadow-2xl z-10">
            {sidebarContent}
          </aside>
        </div>
      )}

      <div className="lg:pl-64 print:pl-0 min-h-screen">
        <div className="pt-6 print:pt-0">{children}</div>
      </div>
    </div>
  );
}
