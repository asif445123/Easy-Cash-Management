import React from "react";

interface IconProps {
  className?: string;
}

/** Colorful bar chart card — Dashboard */
export function DashboardIcon({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <rect x="2" y="3" width="20" height="18" rx="3" fill="#F8FAFC" />
      <rect x="2" y="3" width="20" height="4" rx="2" fill="#E2E8F0" />
      <rect x="5.5" y="13" width="2.8" height="5" rx="0.8" fill="#10B981" />
      <rect x="10.6" y="9" width="2.8" height="9" rx="0.8" fill="#EF4444" />
      <rect x="15.7" y="11" width="2.8" height="7" rx="0.8" fill="#3B82F6" />
    </svg>
  );
}

/** Colorful folder with tag — Account Types */
export function AccountTypesIcon({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M3 6.5A2.5 2.5 0 0 1 5.5 4H9.6l1.7 2H18.5A2.5 2.5 0 0 1 21 8.5v9A2.5 2.5 0 0 1 18.5 20h-13A2.5 2.5 0 0 1 3 17.5v-11Z" fill="#F59E0B" />
      <path d="M3 9h18v8.5A2.5 2.5 0 0 1 18.5 20h-13A2.5 2.5 0 0 1 3 17.5V9Z" fill="#FBBF24" />
      <rect x="7" y="12.5" width="10" height="2" rx="1" fill="#FEF3C7" />
      <circle cx="17" cy="14" r="3" fill="#3B82F6" />
      <path d="M16 14h2M17 13v2" stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

/** Colorful ledger book — Accounts Master File */
export function AccountsMasterIcon({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <rect x="4" y="3" width="16" height="18" rx="2.5" fill="#14B8A6" />
      <rect x="4" y="3" width="4" height="18" rx="1.5" fill="#0F766E" />
      <rect x="10" y="7" width="7" height="2" rx="1" fill="#CCFBF1" />
      <rect x="10" y="11" width="7" height="2" rx="1" fill="#CCFBF1" />
      <rect x="10" y="15" width="4.5" height="2" rx="1" fill="#FDE68A" />
      <path d="M16 3v5l-1.5-1L13 8V3h3Z" fill="#F59E0B" />
    </svg>
  );
}

/** Colorful money bag — Cash Book */
export function CashBookIcon({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M9 4h6l-1.2 3h-3.6L9 4Z" fill="#F59E0B" />
      <path d="M6.5 14.5C6.5 10.6 9 8 12 8s5.5 2.6 5.5 6.5c0 3.5-2.1 6-5.5 6s-5.5-2.5-5.5-6Z" fill="#FBBF24" />
      <rect x="9.2" y="6.8" width="5.6" height="1.8" rx="0.9" fill="#10B981" />
      <path d="M12 11.2v6.6M13.6 12.6c-.4-.4-1-.6-1.6-.6-1 0-1.7.5-1.7 1.2s.7 1 1.7 1.2c1 .2 1.7.5 1.7 1.3s-.8 1.2-1.8 1.2c-.7 0-1.3-.2-1.7-.6" stroke="#92400E" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

/** Colorful calculator / currency tally — Telly Cash */
export function TellyCashIcon({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <rect x="4" y="2.5" width="16" height="19" rx="3" fill="#3B82F6" />
      <rect x="6.5" y="5" width="11" height="4.2" rx="1" fill="#A7F3D0" />
      <circle cx="8" cy="12" r="1.3" fill="#FDE047" />
      <circle cx="12" cy="12" r="1.3" fill="#FFFFFF" />
      <circle cx="16" cy="12" r="1.3" fill="#FFFFFF" />
      <circle cx="8" cy="15.5" r="1.3" fill="#FFFFFF" />
      <circle cx="12" cy="15.5" r="1.3" fill="#FFFFFF" />
      <circle cx="8" cy="19" r="1.3" fill="#FFFFFF" />
      <circle cx="12" cy="19" r="1.3" fill="#FFFFFF" />
      <rect x="14.7" y="14.2" width="2.6" height="6.1" rx="1.3" fill="#10B981" />
    </svg>
  );
}

/** Colorful parchment voucher — Journal Voucher */
export function JournalVoucherIcon({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <rect x="5" y="3" width="14" height="18" rx="2.2" fill="#FEF9C3" />
      <path d="M5 5.2A2.2 2.2 0 0 1 7.2 3h9.6A2.2 2.2 0 0 1 19 5.2V7H5V5.2Z" fill="#F59E0B" />
      <rect x="8" y="10" width="8" height="1.8" rx="0.9" fill="#64748B" />
      <rect x="8" y="13.5" width="6" height="1.8" rx="0.9" fill="#94A3B8" />
      <circle cx="15.5" cy="17" r="2.3" fill="#EF4444" />
      <path d="m14.6 17 .7.7 1.3-1.4" stroke="#FFFFFF" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Colorful bike / speedometer — Motorcycle */
export function MotorcycleIcon({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <circle cx="6.5" cy="16.5" r="3.5" fill="#1E293B" stroke="#94A3B8" strokeWidth="1.5" />
      <circle cx="17.5" cy="16.5" r="3.5" fill="#1E293B" stroke="#94A3B8" strokeWidth="1.5" />
      <path d="M6.5 16.5 10 11h4l2 2.5h2" stroke="#EF4444" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13 8.5h3.2l1.3 8" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="8.5" y="9" width="4" height="2" rx="1" fill="#38BDF8" />
    </svg>
  );
}

/** Colorful lightning meter — Electricity Bill */
export function ElectricityIcon({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9.5" fill="#0EA5E9" />
      <path d="M13.3 5 7.5 13h4.2l-1 6 5.8-8h-4.2l1-6Z" fill="#FACC15" stroke="#FEF08A" strokeWidth="0.6" strokeLinejoin="round" />
    </svg>
  );
}

/** Colorful pie & bar analytics — Show Reports */
export function ReportsIcon({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="2.5" fill="#FDE047" />
      <path d="M12 12V6a6 6 0 0 1 6 6h-6Z" fill="#EF4444" />
      <path d="M12 12h6a6 6 0 1 1-6-6v6Z" fill="#3B82F6" />
      <circle cx="12" cy="12" r="2.2" fill="#FFFFFF" />
    </svg>
  );
}

/** Colorful folder with a gear badge — Manage Accounts */
export function ManageAccountsIcon({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M3 6.5A2.5 2.5 0 0 1 5.5 4H9.6l1.7 2H18.5A2.5 2.5 0 0 1 21 8.5v9A2.5 2.5 0 0 1 18.5 20h-13A2.5 2.5 0 0 1 3 17.5v-11Z" fill="#0EA5E9" />
      <path d="M3 9h18v8.5A2.5 2.5 0 0 1 18.5 20h-13A2.5 2.5 0 0 1 3 17.5V9Z" fill="#38BDF8" />
      <rect x="6.5" y="12.5" width="7" height="1.8" rx="0.9" fill="#E0F2FE" />
      <rect x="6.5" y="15.6" width="5" height="1.8" rx="0.9" fill="#E0F2FE" />
      <circle cx="17.5" cy="14.5" r="4.5" fill="#F59E0B" />
      <path d="M17.5 12.4v1M17.5 15.6v1M15.8 13.5l.9.5M18.3 15l.9.5M19.2 13.5l-.9.5M16.7 15l-.9.5" stroke="#FFFFFF" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}

/** Colorful hierarchy / org chart — Chart of Accounts */
export function ChartOfAccountsIcon({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <rect x="8.5" y="2.5" width="7" height="5" rx="1.5" fill="#4F46E5" />
      <rect x="2.5" y="16.5" width="7" height="5" rx="1.5" fill="#22C55E" />
      <rect x="14.5" y="16.5" width="7" height="5" rx="1.5" fill="#F59E0B" />
      <path d="M12 7.5v4M5.5 16.5v-2.5h13v2.5" stroke="#94A3B8" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M5.5 14h13" stroke="#94A3B8" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

/** Colorful users shield — User Approvals */
export function UserApprovalsIcon({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <circle cx="9.5" cy="8.5" r="3.2" fill="#38BDF8" />
      <path d="M3.5 18.5c0-3 2.7-5 6-5s6 2 6 5" fill="#0284C7" />
      <circle cx="17" cy="16.5" r="4.5" fill="#10B981" />
      <path d="m15 16.6 1.3 1.3 2.7-2.7" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Colorful gear — Settings */
export function SettingsIcon({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path
        d="M10.3 3.2h3.4l.6 2.1c.5.2 1 .4 1.4.7l2-.9 2.4 2.4-.9 2c.3.4.5.9.7 1.4l2.1.6v3.4l-2.1.6c-.2.5-.4 1-.7 1.4l.9 2-2.4 2.4-2-.9c-.4.3-.9.5-1.4.7l-.6 2.1h-3.4l-.6-2.1c-.5-.2-1-.4-1.4-.7l-2 .9-2.4-2.4.9-2c-.3-.4-.5-.9-.7-1.4l-2.1-.6v-3.4l2.1-.6c.2-.5.4-1 .7-1.4l-.9-2 2.4-2.4 2 .9c.4-.3.9-.5 1.4-.7l.6-2.1Z"
        fill="#94A3B8"
      />
      <circle cx="12" cy="12" r="4" fill="#38BDF8" />
      <circle cx="12" cy="12" r="1.8" fill="#1E293B" />
    </svg>
  );
}

/** Colorful support bubble — Contact Us */
export function ContactIcon({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <rect x="3" y="4" width="15" height="12" rx="3" fill="#38BDF8" />
      <path d="M6 16v3.5L10.5 16H6Z" fill="#38BDF8" />
      <rect x="9" y="9" width="12" height="9" rx="2.5" fill="#10B981" />
      <circle cx="13" cy="13.5" r="1" fill="#FFFFFF" />
      <circle cx="16.5" cy="13.5" r="1" fill="#FFFFFF" />
    </svg>
  );
}

/** Colorful exit icon — Logout */
export function LogoutIcon({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H13v18H6.5A2.5 2.5 0 0 1 4 18.5v-13Z" fill="#EF4444" />
      <path d="M11 12h9m0 0-3-3m3 3-3 3" stroke="#FBBF24" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Colorful small icons for the 13 Report sub-items */
export function ReportItemIcon({ kind, className = "w-4 h-4" }: { kind: string; className?: string }) {
  switch (kind) {
    case "accounts-list":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
          <rect x="4" y="3" width="16" height="18" rx="2" fill="#818CF8" />
          <rect x="7" y="7" width="10" height="2" rx="1" fill="#FFFFFF" />
          <rect x="7" y="11" width="10" height="2" rx="1" fill="#C7D2FE" />
          <rect x="7" y="15" width="7" height="2" rx="1" fill="#FDE047" />
        </svg>
      );
    case "journal-voucher":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
          <rect x="4" y="3" width="16" height="18" rx="2" fill="#A855F7" />
          <rect x="7" y="7" width="10" height="2" rx="1" fill="#FEF08A" />
          <rect x="7" y="11.5" width="8" height="2" rx="1" fill="#F3E8FF" />
          <rect x="7" y="16" width="6" height="2" rx="1" fill="#F3E8FF" />
        </svg>
      );
    case "cash-bank-book":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
          <rect x="3" y="5" width="18" height="14" rx="2.5" fill="#10B981" />
          <circle cx="12" cy="12" r="3.2" fill="#FDE047" />
          <rect x="5.5" y="7.5" width="2.5" height="2" rx="0.5" fill="#A7F3D0" />
          <rect x="16" y="14.5" width="2.5" height="2" rx="0.5" fill="#A7F3D0" />
        </svg>
      );
    case "account-ledger":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
          <path d="M3 5.5A2.5 2.5 0 0 1 5.5 3H12v18H5.5A2.5 2.5 0 0 1 3 18.5v-13Z" fill="#3B82F6" />
          <path d="M12 3h6.5A2.5 2.5 0 0 1 21 5.5v13a2.5 2.5 0 0 1-2.5 2.5H12V3Z" fill="#60A5FA" />
          <rect x="5.5" y="7" width="4" height="1.8" rx="0.9" fill="#FFFFFF" />
          <rect x="14.5" y="7" width="4" height="1.8" rx="0.9" fill="#FEF08A" />
        </svg>
      );
    case "receivable-payable":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="9.5" fill="#1E293B" stroke="#38BDF8" strokeWidth="1.5" />
          <path d="M8 9h8l-2.2-2.2M16 15H8l2.2 2.2" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M16 15H8l2.2 2.2" stroke="#F87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "trial-balance-2":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
          <rect x="3" y="4" width="8.5" height="16" rx="2" fill="#38BDF8" />
          <rect x="12.5" y="4" width="8.5" height="16" rx="2" fill="#F59E0B" />
          <rect x="5" y="8" width="4.5" height="2" rx="1" fill="#FFFFFF" />
          <rect x="14.5" y="8" width="4.5" height="2" rx="1" fill="#FFFFFF" />
        </svg>
      );
    case "trial-balance-6":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
          <rect x="3" y="4" width="18" height="16" rx="2.5" fill="#14B8A6" />
          <path d="M3 9h18M9 4v16M15 4v16" stroke="#CCFBF1" strokeWidth="1.4" />
        </svg>
      );
    case "month-wise":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
          <rect x="3" y="4" width="18" height="17" rx="2.5" fill="#F8FAFC" />
          <path d="M3 6.5A2.5 2.5 0 0 1 5.5 4h13A2.5 2.5 0 0 1 21 6.5V9H3V6.5Z" fill="#EF4444" />
          <rect x="6.5" y="12" width="3" height="6" rx="0.8" fill="#3B82F6" />
          <rect x="10.5" y="13.5" width="3" height="4.5" rx="0.8" fill="#10B981" />
          <rect x="14.5" y="11" width="3" height="7" rx="0.8" fill="#F59E0B" />
        </svg>
      );
    case "month-comparison":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="3" fill="#1E293B" stroke="#64748B" strokeWidth="1.2" />
          <rect x="5.5" y="10" width="3" height="7.5" rx="1" fill="#38BDF8" />
          <rect x="9.5" y="7" width="3" height="10.5" rx="1" fill="#FB923C" />
          <rect x="14" y="12" width="3" height="5.5" rx="1" fill="#38BDF8" />
          <rect x="18" y="8.5" width="2" height="9" rx="1" fill="#FB923C" />
        </svg>
      );
    case "year-wise":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
          <rect x="3" y="4" width="18" height="16" rx="2.5" fill="#F59E0B" />
          <path d="M6 15.5 10 11l3.5 3 4.5-5.5" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "year-comparison":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
          <rect x="3" y="4" width="18" height="16" rx="2.5" fill="#7C3AED" />
          <path d="M6 16 10 12l3 2 5-6" stroke="#34D399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M6 12 10 14l3-3 5 2" stroke="#FDE047" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "motorcycle":
      return <MotorcycleIcon className={className} />;
    case "electricity":
      return <ElectricityIcon className={className} />;
    default:
      return <ReportsIcon className={className} />;
  }
}
