"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Swal from "sweetalert2";
import { useAuth } from "@/context/AuthContext";
import PasswordInput from "@/components/PasswordInput";

export default function SettingsPage() {
  const { user, refresh } = useAuth();
  const [profile, setProfile] = useState({ name: "", email: "", phone: "" });
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setProfile({ name: user.name, email: user.email, phone: user.phone || "" });
    }
  }, [user]);

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      const data = await res.json();

      if (!res.ok) {
        await Swal.fire({ icon: "error", title: "Could not update profile", text: data.message });
        return;
      }

      await Swal.fire({ icon: "success", title: "Profile updated", timer: 1000, showConfirmButton: false });
      await refresh();
    } finally {
      setSavingProfile(false);
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      await Swal.fire({ icon: "error", title: "Passwords don't match", confirmButtonColor: "#0E7C4A" });
      return;
    }

    setSavingPassword(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        await Swal.fire({ icon: "error", title: "Could not update password", text: data.message });
        return;
      }

      await Swal.fire({ icon: "success", title: "Password updated", timer: 1000, showConfirmButton: false });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } finally {
      setSavingPassword(false);
    }
  }

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center text-ink/50">Loading…</div>;
  }

  return (
    <main className="min-h-screen bg-paper">
      <header className="max-w-3xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-accent font-display font-bold">
            ₨
          </span>
          <span className="font-display font-semibold text-lg tracking-tight">EasyCash</span>
        </div>
        <Link href="/dashboard" className="text-sm text-ink/70 hover:text-ink transition-colors">
          Back to dashboard
        </Link>
      </header>

      <div className="max-w-3xl mx-auto px-6 pb-16 space-y-8">
        <h1 className="font-display text-2xl font-bold text-ink">Account settings</h1>

        <section className="bg-white rounded-2xl border border-ink/10 p-6">
          <h2 className="font-display text-lg font-semibold text-ink mb-4">Profile</h2>
          <form onSubmit={handleProfileSubmit} className="space-y-4 max-w-sm">
            <div>
              <label className="block text-sm font-medium text-ink/80 mb-1">Full name</label>
              <input
                required
                value={profile.name}
                onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                className="w-full rounded-lg border border-ink/15 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink/80 mb-1">Email</label>
              <input
                type="email"
                required
                value={profile.email}
                onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                className="w-full rounded-lg border border-ink/15 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink/80 mb-1">Phone</label>
              <input
                value={profile.phone}
                onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                className="w-full rounded-lg border border-ink/15 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                placeholder="03xx-xxxxxxx"
              />
            </div>
            <button
              type="submit"
              disabled={savingProfile}
              className="px-5 py-2.5 rounded-lg bg-primary text-white font-semibold hover:bg-primary-dark transition-colors disabled:opacity-60"
            >
              {savingProfile ? "Saving…" : "Save changes"}
            </button>
          </form>
        </section>

        <section className="bg-white rounded-2xl border border-ink/10 p-6">
          <h2 className="font-display text-lg font-semibold text-ink mb-4">Change password</h2>
          <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-sm">
            <div>
              <label className="block text-sm font-medium text-ink/80 mb-1">Current password</label>
              <PasswordInput
                value={currentPassword}
                onChange={setCurrentPassword}
                required
                autoComplete="current-password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink/80 mb-1">New password</label>
              <PasswordInput
                value={newPassword}
                onChange={setNewPassword}
                required
                minLength={6}
                autoComplete="new-password"
                placeholder="At least 6 characters"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink/80 mb-1">Confirm new password</label>
              <PasswordInput
                value={confirmPassword}
                onChange={setConfirmPassword}
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>
            <button
              type="submit"
              disabled={savingPassword}
              className="px-5 py-2.5 rounded-lg bg-primary text-white font-semibold hover:bg-primary-dark transition-colors disabled:opacity-60"
            >
              {savingPassword ? "Updating…" : "Update password"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
