"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Swal from "sweetalert2";
import PasswordInput from "@/components/PasswordInput";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [submitting, setSubmitting] = useState(false);

  function update(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        await Swal.fire({
          icon: "error",
          title: "Could not register",
          text: data.message || "Something went wrong.",
          confirmButtonColor: "#0E7C4A",
        });
        return;
      }

      await Swal.fire({
        icon: "success",
        title: "Account created",
        text: "An admin will review your account. You'll be able to log in once approved.",
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
          <h1 className="font-display text-2xl font-bold text-ink">Create an account</h1>
          <p className="text-ink/60 text-sm mt-1">Your account needs admin approval before login</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-ink/10 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink/80 mb-1">Full name</label>
            <input
              required
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              className="w-full rounded-lg border border-ink/15 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="Muhammad Asif"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink/80 mb-1">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              className="w-full rounded-lg border border-ink/15 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink/80 mb-1">Phone (optional)</label>
            <input
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              className="w-full rounded-lg border border-ink/15 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="03xx-xxxxxxx"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink/80 mb-1">Password</label>
            <PasswordInput
              value={form.password}
              onChange={(v) => update("password", v)}
              required
              minLength={6}
              autoComplete="new-password"
              placeholder="At least 6 characters"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 rounded-lg bg-primary text-white font-semibold hover:bg-primary-dark transition-colors disabled:opacity-60"
          >
            {submitting ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="text-center text-sm text-ink/60 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-semibold hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
