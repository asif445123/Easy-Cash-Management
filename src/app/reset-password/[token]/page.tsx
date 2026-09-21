"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Swal from "sweetalert2";
import PasswordInput from "@/components/PasswordInput";

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useParams<{ token: string }>();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (password !== confirmPassword) {
      await Swal.fire({ icon: "error", title: "Passwords don't match", confirmButtonColor: "#0E7C4A" });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: params.token, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        await Swal.fire({ icon: "error", title: "Could not reset password", text: data.message });
        return;
      }

      await Swal.fire({
        icon: "success",
        title: "Password reset",
        text: "You can now log in with your new password.",
        confirmButtonColor: "#0E7C4A",
      });
      router.push("/login");
    } catch {
      await Swal.fire({
        icon: "error",
        title: "Network error",
        text: "Could not reach the server. Please try again.",
        confirmButtonColor: "#0E7C4A",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-paper flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <span className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-accent font-display font-bold">
              ₨
            </span>
            <span className="font-display font-semibold text-lg tracking-tight">EasyCash</span>
          </Link>
          <h1 className="font-display text-2xl font-bold text-ink">Set a new password</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-ink/10 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink/80 mb-1">New password</label>
            <PasswordInput
              value={password}
              onChange={setPassword}
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
              placeholder="Re-enter password"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 rounded-lg bg-primary text-white font-semibold hover:bg-primary-dark transition-colors disabled:opacity-60"
          >
            {submitting ? "Resetting…" : "Reset password"}
          </button>
        </form>

        <p className="text-center text-sm text-ink/60 mt-6">
          <Link href="/login" className="text-primary font-semibold hover:underline">
            Back to log in
          </Link>
        </p>
      </div>
    </main>
  );
}
