"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { FaChevronDown } from "react-icons/fa";
import type { IconType } from "react-icons";
import type { DemoNavItem } from "@/lib/demoNav";

interface DemoMenuProps {
  label: string;
  icon: IconType;
  items: DemoNavItem[];
  variant?: "primary" | "outline";
}

/**
 * Looks and behaves like the real AddEntryMenu / ReportsMenu dropdowns.
 * Each item now navigates straight to a real (read-only, sample-data) page
 * under /demo, so a visitor can actually see how the feature works. Any
 * Save/Preview/Print button on those pages is what triggers the "create a
 * free account" prompt — browsing itself is free.
 */
export default function DemoMenu({ label, icon: Icon, items, variant = "outline" }: DemoMenuProps) {
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

  const buttonClass =
    variant === "primary"
      ? "flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors"
      : "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-ink/15 text-ink/80 text-sm font-medium hover:bg-ink/5 transition-colors";

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} className={buttonClass}>
        <Icon size={11} />
        {label}
        <FaChevronDown size={10} className={open ? "rotate-180 transition-transform" : "transition-transform"} />
      </button>

      {open && (
        <div className="absolute left-0 mt-2 w-64 bg-white rounded-xl border border-ink/10 shadow-lg py-1 z-20">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block w-full text-left px-4 py-2 text-sm text-ink/80 hover:bg-ink/5 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
