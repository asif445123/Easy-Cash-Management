"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { FaSignOutAlt } from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";

/** "Rana Asif" -> "RA". Falls back to the first letter, or "?" if no name. */
function getInitials(name?: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

interface UserMenuProps {
  /** "dark" is for the dark mobile top bar; "light" (default) for page headers. */
  variant?: "light" | "dark";
}

/**
 * Avatar that opens the account dropdown: the signed-in name and email, and
 * Logout — nothing else. Settings already has its own sidebar link, and the
 * dropdown intentionally carries no language switcher.
 */
export default function UserMenu({ variant = "light" }: UserMenuProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
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

  async function handleLogout() {
    setOpen(false);
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

  if (!user) return null;

  const onDark = variant === "dark";

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        className={`flex items-center gap-2 rounded-full transition-colors ${
          onDark ? "text-white" : "text-ink/80 hover:text-ink"
        }`}
      >
        <span
          className={`rounded-full bg-primary text-white text-xs font-semibold flex items-center justify-center shrink-0 ${
            onDark ? "w-8 h-8" : "w-8 h-8 ring-2 ring-primary/15"
          }`}
          aria-hidden="true"
        >
          {getInitials(user.name)}
        </span>
        <span className={`text-sm hidden sm:inline ${onDark ? "text-white" : "text-ink"}`}>
          {user.name}
        </span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-60 bg-white rounded-xl border border-ink/10 shadow-xl overflow-hidden z-40"
        >
          {/* Signed-in identity, exactly like the reference dropdown */}
          <div className="px-4 py-3 border-b border-ink/10 bg-ink/[0.02]">
            <p className="text-sm font-bold text-ink truncate">{user.name}</p>
            <p className="text-xs text-ink/50 truncate">{user.email}</p>
          </div>

          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            className="flex items-center gap-2.5 w-full text-left px-4 py-3 text-sm font-medium text-danger hover:bg-danger/[0.07] transition-colors"
          >
            <FaSignOutAlt size={14} className="shrink-0" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
