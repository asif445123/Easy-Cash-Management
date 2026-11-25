"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { FaBars, FaChevronDown, FaTimes } from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";
import ContactUsModal from "@/components/ContactUsModal";
import UserMenu from "@/components/UserMenu";
import {
  AccountTypesIcon,
  AccountsMasterIcon,
  CashBookIcon,
  ChartOfAccountsIcon,
  ContactIcon,
  DashboardIcon,
  ElectricityIcon,
  JournalVoucherIcon,
  LogoutIcon,
  ManageAccountsIcon,
  MotorcycleIcon,
  ReportItemIcon,
  ReportsIcon,
  SettingsIcon,
  TellyCashIcon,
  UserApprovalsIcon,
} from "@/components/SidebarIcons";

// "Manage Accounts" sub-links: the setup screens for the chart of accounts.
const MANAGE_NAV = [
  { href: "/admin/account-types", label: "Account Types", icon: AccountTypesIcon },
  { href: "/admin/accounts", label: "Accounts Master File", icon: AccountsMasterIcon },
  { href: "/admin/chart-of-accounts", label: "Chart of Accounts", icon: ChartOfAccountsIcon },
];

const ENTRY_NAV = [
  { href: "/admin/cashbook", label: "Cash Book", icon: CashBookIcon },
  { href: "/admin/telly-cash", label: "Telly Cash", icon: TellyCashIcon },
  { href: "/admin/journal", label: "Journal Voucher", icon: JournalVoucherIcon },
  { href: "/admin/motorcycle", label: "Motorcycle", icon: MotorcycleIcon },
  { href: "/admin/electricity", label: "Electricity Bill", icon: ElectricityIcon },
];

const REPORT_NAV = [
  { href: "/admin/reports/accounts-list", label: "Accounts List", kind: "accounts-list" },
  { href: "/admin/reports/journal-voucher", label: "Journal Voucher Report", kind: "journal-voucher" },
  { href: "/admin/reports/cash-bank-book", label: "Cash / Bank Book", kind: "cash-bank-book" },
  { href: "/admin/reports/account-ledger", label: "Account Ledger", kind: "account-ledger" },
  { href: "/admin/reports/receivable-payable", label: "Receivable / Payable", kind: "receivable-payable" },
  { href: "/admin/reports/trial-balance-2col", label: "Trial Balance (2 Col)", kind: "trial-balance-2" },
  { href: "/admin/reports/trial-balance-6col", label: "Trial Balance (6 Col)", kind: "trial-balance-6" },
  { href: "/admin/reports/month-wise", label: "Month Wise Report", kind: "month-wise" },
  { href: "/admin/reports/month-wise-comparison", label: "Month Wise Comparison", kind: "month-comparison" },
  { href: "/admin/reports/year-wise", label: "Year Wise Report", kind: "year-wise" },
  { href: "/admin/reports/year-wise-comparison", label: "Year Wise Comparison", kind: "year-comparison" },
  { href: "/admin/reports/motorcycle", label: "Motorcycle Report", kind: "motorcycle" },
  { href: "/admin/reports/electricity", label: "Electricity Bill Report", kind: "electricity" },
];

function getInitials(name?: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isAdmin = user?.role === "admin";

  const onReportRoute = pathname.startsWith("/admin/reports");
  const onManageRoute = MANAGE_NAV.some((link) => pathname === link.href);
  const [reportsOpen, setReportsOpen] = useState(onReportRoute);
  const [manageOpen, setManageOpen] = useState(onManageRoute);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  // Keep Show Reports expanded when navigating onto a report route, and close mobile drawer.
  useEffect(() => {
    if (pathname.startsWith("/admin/reports")) {
      setReportsOpen(true);
    }
    if (MANAGE_NAV.some((link) => pathname === link.href)) {
      setManageOpen(true);
    }
    setMobileOpen(false);
  }, [pathname]);

  // Close mobile drawer on Escape
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setMobileOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  async function handleLogout() {
    setMobileOpen(false);
    const result = await Swal.fire({
      icon: "question",
      title: "Log out?",
      showCancelButton: true,
      confirmButtonText: "Log out",
      confirmButtonColor: "#B3452C",
    });
    if (result.isConfirmed) {
      await logout();
      router.push("/login");
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
      {/* Brand header */}
      <div className="px-4 py-4 border-b border-white/10 flex items-center justify-between gap-2 shrink-0">
        <Link
          href="/dashboard"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-2.5 min-w-0"
        >
          <span className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-accent font-display font-bold shrink-0 shadow-sm">
            ₨
          </span>
          <span className="font-display font-bold text-base leading-tight tracking-tight text-white truncate">
            EasyCash Admin
          </span>
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

      {/* Scrollable navigation items */}
      <nav aria-label="Sidebar navigation" className="flex-1 overflow-y-auto py-2">
        <Link href="/dashboard" className={linkClass(isActive("/dashboard", true))}>
          <DashboardIcon className="w-5 h-5 shrink-0" />
          <span className="truncate">Dashboard</span>
        </Link>

        {ENTRY_NAV.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className={linkClass(isActive(item.href))}>
              <Icon className="w-5 h-5 shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}

        {/* Expandable Manage Accounts section */}
        <div>
          <button
            type="button"
            onClick={() => setManageOpen((o) => !o)}
            aria-expanded={manageOpen}
            className={`flex items-center justify-between w-full px-4 py-2.5 text-sm transition-colors ${
              onManageRoute && !manageOpen
                ? "bg-[#2563EB] text-white font-medium"
                : "text-slate-200 hover:bg-white/[0.08] hover:text-white"
            }`}
          >
            <span className="flex items-center gap-3 min-w-0">
              <ManageAccountsIcon className="w-5 h-5 shrink-0" />
              <span className="truncate">Manage Accounts</span>
            </span>
            <FaChevronDown
              size={11}
              className={`shrink-0 text-slate-400 transition-transform duration-200 ${
                manageOpen ? "rotate-180 text-white" : ""
              }`}
            />
          </button>

          {manageOpen && (
            <div className="bg-[#0B1120] py-1 border-y border-white/5">
              {MANAGE_NAV.map((link) => {
                const active = isActive(link.href, true);
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2.5 pl-8 pr-4 py-2 text-[13px] transition-colors ${
                      active
                        ? "bg-[#2563EB] text-white font-medium"
                        : "text-slate-300 hover:bg-white/[0.07] hover:text-white"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{link.label}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Expandable Reports section */}
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
              {REPORT_NAV.map((report) => {
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

        {isAdmin && (
          <Link href="/admin" className={linkClass(isActive("/admin", true))}>
            <UserApprovalsIcon className="w-5 h-5 shrink-0" />
            <span className="truncate">User approvals</span>
          </Link>
        )}

        <div className="my-2 border-t border-white/10" />

        <Link href="/settings" className={linkClass(isActive("/settings"))}>
          <SettingsIcon className="w-5 h-5 shrink-0" />
          <span className="truncate">Settings</span>
        </Link>

        <button
          type="button"
          onClick={() => {
            setContactOpen(true);
            setMobileOpen(false);
          }}
          className={linkClass(false)}
        >
          <ContactIcon className="w-5 h-5 shrink-0" />
          <span className="truncate">Contact Us</span>
        </button>
      </nav>

      {/* Bottom user profile & logout */}
      {user && (
        <div className="border-t border-white/10 p-3 shrink-0 bg-[#0B1120]">
          <div className="flex items-center gap-2.5 px-1 pb-2.5">
            <span className="w-8 h-8 rounded-full bg-primary text-white text-xs font-semibold flex items-center justify-center shrink-0">
              {getInitials(user.name)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm text-rose-300 hover:bg-rose-500/15 hover:text-rose-200 transition-colors"
          >
            <LogoutIcon className="w-4 h-4 shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-paper">
      {/* Desktop fixed left sidebar */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 w-64 z-30 border-r border-white/10 print:hidden">
        {sidebarContent}
      </aside>

      {/* Mobile / tablet top bar */}
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
          <Link href="/dashboard" className="flex items-center gap-2 min-w-0">
            <span className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-accent font-display font-bold text-sm shrink-0">
              ₨
            </span>
            <span className="font-display font-bold text-base tracking-tight truncate">
              EasyCash Admin
            </span>
          </Link>
        </div>

        {user && <UserMenu variant="dark" />}
      </header>

      {/* Mobile drawer overlay */}
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

      {/* Main content area offset by sidebar width on desktop */}
      <div className="lg:pl-64 print:pl-0 min-h-screen">
        {/* Desktop top bar: account dropdown with Logout lives here */}
        <header className="hidden lg:flex sticky top-0 z-20 h-14 items-center justify-end gap-3 px-6 bg-paper/90 backdrop-blur border-b border-ink/10 print:hidden">
          <UserMenu />
        </header>

        <div className="pt-6 print:pt-0">{children}</div>
      </div>

      <ContactUsModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </div>
  );
}
