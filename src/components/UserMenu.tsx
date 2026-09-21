"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { FaCog, FaSignOutAlt } from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";

/** "Rana Asif" -> "RA". Falls back to the first letter, or "?" if no name. */
function getInitials(name?: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Avatar circle (showing the user's initials) that opens a dropdown with Settings and Logout. */
export default function UserMenu() {
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

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 text-ink/80 hover:text-ink transition-colors"
        aria-label="Account menu"
      >
        <span
          className="w-7 h-7 rounded-full bg-primary text-white text-xs font-semibold flex items-center justify-center shrink-0"
          aria-hidden="true"
        >
          {getInitials(user.name)}
        </span>
        <span className="text-sm hidden sm:inline">{user.name}</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl border border-ink/10 shadow-lg py-1 z-20">
          <div className="px-4 py-2 border-b border-ink/5">
            <p className="text-sm font-medium text-ink truncate">{user.name}</p>
            <p className="text-xs text-ink/50 truncate">{user.email}</p>
          </div>
          <Link
            href="/settings"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-ink/80 hover:bg-ink/5 transition-colors"
          >
            <FaCog size={14} />
            Settings
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-danger hover:bg-danger/5 transition-colors"
          >
            <FaSignOutAlt size={14} />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
