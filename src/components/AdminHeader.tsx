"use client";

import { useState } from "react";
import Link from "next/link";
import { FaBars, FaTimes } from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";
import UserMenu from "@/components/UserMenu";
import AddEntryMenu from "@/components/AddEntryMenu";
import ReportsMenu from "@/components/ReportsMenu";
import ContactUsModal from "@/components/ContactUsModal";

interface AdminHeaderProps {
  /** Extra nav links specific to a page (e.g. "Inventory items" on /admin). Optional. */
  extraLinks?: { href: string; label: string }[];
}

/**
 * Shared header for the accounting screens. Add Entry / Show Reports /
 * Dashboard are available to any approved user; "User approvals" and
 * "Inventory items" are admin-only and hidden otherwise.
 *
 * On small screens the nav links collapse behind a hamburger toggle —
 * with 7+ items (Add Entry, Show Reports, admin links, Dashboard,
 * Contact Us, the user menu) this never fit comfortably on a phone
 * width in one row.
 */
export default function AdminHeader({ extraLinks = [] }: AdminHeaderProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [contactOpen, setContactOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = (
    <>
      <AddEntryMenu />
      <ReportsMenu />
      {isAdmin && (
        <Link
          href="/admin"
          onClick={() => setMobileOpen(false)}
          className="text-sm text-ink/70 hover:text-ink transition-colors"
        >
          User approvals
        </Link>
      )}
      {isAdmin && (
        <Link
          href="/admin/items"
          onClick={() => setMobileOpen(false)}
          className="text-sm text-ink/70 hover:text-ink transition-colors"
        >
          Inventory items
        </Link>
      )}
      {extraLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          onClick={() => setMobileOpen(false)}
          className="text-sm text-ink/70 hover:text-ink transition-colors"
        >
          {link.label}
        </Link>
      ))}
      <Link
        href="/dashboard"
        onClick={() => setMobileOpen(false)}
        className="text-sm text-ink/70 hover:text-ink transition-colors"
      >
        Dashboard
      </Link>
      <button
        onClick={() => {
          setContactOpen(true);
          setMobileOpen(false);
        }}
        className="text-sm text-ink/70 hover:text-ink transition-colors text-left"
      >
        Contact Us
      </button>
    </>
  );

  return (
    <header className="max-w-5xl mx-auto px-6 py-6">
      <div className="flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-accent font-display font-bold">
            ₨
          </span>
          <span className="font-display font-semibold text-lg tracking-tight">EasyCash Admin</span>
        </Link>

        {/* Full nav — visible from the small breakpoint up */}
        <div className="hidden sm:flex items-center gap-4 flex-wrap">
          {navLinks}
          <UserMenu />
        </div>

        {/* Mobile: user avatar stays visible, plus a hamburger toggle for everything else */}
        <div className="flex sm:hidden items-center gap-3">
          <UserMenu />
          <button
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-ink/15 text-ink/70 hover:bg-ink/5 transition-colors"
          >
            {mobileOpen ? <FaTimes size={16} /> : <FaBars size={16} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown panel */}
      {mobileOpen && (
        <div className="sm:hidden mt-4 flex flex-col items-start gap-3 bg-white rounded-xl border border-ink/10 p-4">
          {navLinks}
        </div>
      )}

      <ContactUsModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </header>
  );
}
