"use client";

import { useState } from "react";
import Link from "next/link";
import Swal from "sweetalert2";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        await Swal.fire({ icon: "error", title: "Something went wrong", text: data.message });
        return;
      }

      setSent(true);
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
          <h1 className="font-display text-2xl font-bold text-ink">Forgot password</h1>
          <p className="text-ink/60 text-sm mt-1">We'll email you a reset link</p>
        </div>

        <div className="bg-white rounded-2xl border border-ink/10 p-6">
          {sent ? (
            <p className="text-sm text-ink/70 text-center">
              If an account exists for <span className="font-medium text-ink">{email}</span>, a
              password reset link is on its way. Check your inbox (and spam folder).
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink/80 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-ink/15 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  placeholder="you@example.com"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 rounded-lg bg-primary text-white font-semibold hover:bg-primary-dark transition-colors disabled:opacity-60"
              >
                {submitting ? "Sending…" : "Send reset link"}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-ink/60 mt-6">
          Remembered it?{" "}
          <Link href="/login" className="text-primary font-semibold hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
