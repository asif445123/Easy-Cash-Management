"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { FaChevronUp, FaSignOutAlt } from "react-icons/fa";
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
  /**
   * "dark" is for the dark mobile top bar; "light" (default) for page headers;
   * "sidebar" is the full-width profile row pinned to the bottom of the sidebar,
   * whose dropdown opens upward.
   */
  variant?: "light" | "dark" | "sidebar";
}

/**
 * Account dropdown: the avatar and name are always visible, and clicking them
 * opens a panel with the signed-in name, email, and Logout — nothing else.
 * Settings already has its own sidebar link, and the dropdown intentionally
 * carries no language switcher.
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
  const inSidebar = variant === "sidebar";

  return (
    <div className={inSidebar ? "relative w-full" : "relative"} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        className={
          inSidebar
            ? "flex items-center gap-2.5 w-full px-1 py-1 rounded-lg text-white hover:bg-white/[0.06] transition-colors"
            : `flex items-center gap-2 rounded-full transition-colors ${
                onDark ? "text-white" : "text-ink/80 hover:text-ink"
              }`
        }
      >
        <span
          className={`rounded-full bg-primary text-white text-xs font-semibold flex items-center justify-center shrink-0 ${
            onDark || inSidebar ? "w-8 h-8" : "w-8 h-8 ring-2 ring-primary/15"
          }`}
          aria-hidden="true"
        >
          {getInitials(user.name)}
        </span>
        {inSidebar ? (
          <>
            <span className="text-sm font-medium text-white truncate min-w-0 flex-1 text-left">{user.name}</span>
            <FaChevronUp
              size={10}
              className={`shrink-0 text-slate-400 transition-transform duration-200 ${open ? "" : "rotate-180"}`}
              aria-hidden="true"
            />
          </>
        ) : (
          <span className={`text-sm hidden sm:inline ${onDark ? "text-white" : "text-ink"}`}>
            {user.name}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className={
            inSidebar
              ? "absolute left-0 right-0 bottom-full mb-2 bg-[#1E293B] text-white rounded-xl border border-white/10 shadow-2xl overflow-hidden z-40"
              : "absolute right-0 mt-2 w-60 bg-white rounded-xl border border-ink/10 shadow-xl overflow-hidden z-40"
          }
        >
          {/* Signed-in identity */}
          <div className={`px-4 py-3 border-b ${inSidebar ? "border-white/10 bg-white/[0.03]" : "border-ink/10 bg-ink/[0.02]"}`}>
            <p className={`text-sm font-bold truncate ${inSidebar ? "text-white" : "text-ink"}`}>{user.name}</p>
            <p className={`text-xs truncate ${inSidebar ? "text-slate-400" : "text-ink/50"}`}>{user.email}</p>
          </div>

          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            className={`flex items-center gap-2.5 w-full text-left px-4 py-3 text-sm font-medium transition-colors ${
              inSidebar
                ? "text-rose-300 hover:bg-rose-500/15 hover:text-rose-200"
                : "text-danger hover:bg-danger/[0.07]"
            }`}
          >
            <FaSignOutAlt size={14} className="shrink-0" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
