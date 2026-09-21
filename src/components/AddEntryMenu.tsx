"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { FaPlus, FaChevronDown } from "react-icons/fa";

const ENTRY_LINKS = [
  { href: "/admin/account-types", label: "Account Types" },
  { href: "/admin/accounts", label: "Accounts Master File" },
  { href: "/admin/cashbook", label: "Cash Book" },
  { href: "/admin/journal", label: "Journal Voucher" },
  { href: "/admin/motorcycle", label: "Motorcycle" },
  { href: "/admin/electricity", label: "Electricity Bill" },
];

/** "Add Entry" navbar dropdown linking to the four accounting entry screens. */
export default function AddEntryMenu() {
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
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors"
      >
        <FaPlus size={11} />
        Add Entry
        <FaChevronDown size={10} className={open ? "rotate-180 transition-transform" : "transition-transform"} />
      </button>

      {open && (
        <div className="absolute left-0 mt-2 w-56 bg-white rounded-xl border border-ink/10 shadow-lg py-1 z-20">
          {ENTRY_LINKS.map((link) => (
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
