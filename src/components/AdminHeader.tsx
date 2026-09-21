"use client";

import { useState } from "react";
import Link from "next/link";
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
 */
export default function AdminHeader({ extraLinks = [] }: AdminHeaderProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <header className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between flex-wrap gap-4">
      <div className="flex items-center gap-2">
        <span className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-accent font-display font-bold">
          ₨
        </span>
        <span className="font-display font-semibold text-lg tracking-tight">EasyCash Admin</span>
      </div>
      <div className="flex items-center gap-4 flex-wrap">
        <AddEntryMenu />
        <ReportsMenu />
        {isAdmin && (
          <Link href="/admin" className="text-sm text-ink/70 hover:text-ink transition-colors">
            User approvals
          </Link>
        )}
        {isAdmin && (
          <Link href="/admin/items" className="text-sm text-ink/70 hover:text-ink transition-colors">
            Inventory items
          </Link>
        )}
        {extraLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-sm text-ink/70 hover:text-ink transition-colors"
          >
            {link.label}
          </Link>
        ))}
        <Link href="/dashboard" className="text-sm text-ink/70 hover:text-ink transition-colors">
          Dashboard
        </Link>
        <button
          onClick={() => setContactOpen(true)}
          className="text-sm text-ink/70 hover:text-ink transition-colors"
        >
          Contact Us
        </button>
        <UserMenu />
      </div>

      <ContactUsModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </header>
  );
}
