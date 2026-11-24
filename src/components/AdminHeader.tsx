"use client";

import Link from "next/link";

interface AdminHeaderProps {
  /** Extra nav links specific to a page. Optional. */
  extraLinks?: { href: string; label: string }[];
}

/**
 * Navigation moved to the left sidebar in AppShell (rendered by /dashboard,
 * /admin, and /settings layouts). Kept as a lightweight optional sub-header
 * only when a page supplies `extraLinks`.
 */
export default function AdminHeader({ extraLinks = [] }: AdminHeaderProps) {
  if (extraLinks.length === 0) return null;

  return (
    <div className="max-w-5xl mx-auto px-6 pb-4 flex items-center gap-4 flex-wrap">
      {extraLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="text-sm text-ink/70 hover:text-ink transition-colors"
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
}
