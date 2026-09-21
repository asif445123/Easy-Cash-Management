"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Swal from "sweetalert2";
import { useAuth } from "@/context/AuthContext";
import PasswordInput from "@/components/PasswordInput";
import ContactUsModal from "@/components/ContactUsModal"; // <-- adjust path if different

export default function LoginPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showDemoOption, setShowDemoOption] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  async function showAccessDeniedAlert() {
    const WHATSAPP_NUMBER = "923205501173";
    const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

    await Swal.fire({
      html: `
        <div style="text-align:center; padding:8px 4px;">
          <div style="display:flex;justify-content:center;margin-bottom:14px;">
            <div style="width:70px;height:70px;border-radius:50%;border:3px solid #ef4444;display:flex;align-items:center;justify-content:center;">
              <svg viewBox="0 0 24 24" width="38" height="38" fill="none" stroke="#ef4444" stroke-width="3" stroke-linecap="round">
                <line x1="5" y1="19" x2="19" y2="5"/>
              </svg>
            </div>
          </div>
          <h2 style="color:#b91c1c;font-size:22px;font-weight:700;margin:0 0 10px;font-family:serif;">Access Denied</h2>
          <p style="color:#475569;font-size:14px;margin:0 0 16px;line-height:1.5;">
            Your account was rejected by the admin. Please contact us on WhatsApp or via the Contact form for approval.
          </p>
          <div style="display:flex; gap:12px; justify-content:center; margin-bottom:16px;">
            <button id="waBtn" type="button" title="Chat on WhatsApp"
               style="display:flex;align-items:center;justify-content:center;width:42px;height:42px;border-radius:10px;background:#25D366;border:none;cursor:pointer;">
              <svg viewBox="0 0 32 32" width="20" height="20" fill="#fff" aria-hidden="true">
                <path d="M16.001 3C9.096 3 3.5 8.596 3.5 15.5c0 2.42.687 4.68 1.877 6.6L3 29l7.09-2.334A12.44 12.44 0 0 0 16 28c6.905 0 12.5-5.596 12.5-12.5S22.905 3 16.001 3Zm7.24 17.61c-.303.854-1.502 1.564-2.463 1.77-.655.14-1.51.25-4.39-.943-3.686-1.527-6.058-5.26-6.243-5.505-.178-.245-1.5-1.995-1.5-3.807 0-1.812.949-2.7 1.286-3.07.303-.33.663-.412.884-.412.221 0 .442.002.634.012.204.01.478-.078.747.57.303.734.995 2.545 1.083 2.73.088.185.147.402.03.647-.118.245-.176.397-.352.611-.176.216-.37.481-.529.646-.176.185-.36.386-.155.756.206.37.914 1.51 1.963 2.446 1.35 1.204 2.489 1.577 2.858 1.755.37.177.586.147.802-.088.216-.235.914-1.066 1.16-1.432.245-.366.49-.303.826-.183.335.12 2.129 1.005 2.494 1.188.365.183.608.274.696.427.088.153.088.883-.216 1.738Z"/>
              </svg>
            </button>
            <button id="contactBtn" type="button" title="Contact Us"
               style="display:flex;align-items:center;justify-content:center;width:42px;height:42px;border-radius:10px;background:#2563eb;border:none;cursor:pointer;">
              <svg viewBox="0 0 512 512" width="20" height="20" fill="#fff"><path d="M48 64C21.5 64 0 85.5 0 112c0 15.1 7.1 29.3 19.2 38.4L236.8 313.6c11.4 8.5 27 8.5 38.4 0L492.8 150.4c12.1-9.1 19.2-23.3 19.2-38.4c0-26.5-21.5-48-48-48H48zM0 176V384c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V176L294.4 339.2c-22.8 17.1-54 17.1-76.8 0L0 176z"/></svg>
            </button>
          </div>
          <p style="font-size:13px;margin:0;color:#475569;">
            <a id="backToLoginLink" href="#" style="color:#2563eb;font-weight:600;text-decoration:none;">← Back to Login</a>
            <span style="color:#94a3b8;"> or </span>
            <a id="viewDemoLink" href="#" style="color:#2563eb;font-weight:600;text-decoration:none;">View Demo</a>
          </p>
        </div>
      `,
      showConfirmButton: false,
      showCloseButton: true,
      background: "#f8fafc",
      width: 400,
      padding: "1.5rem",
      didOpen: () => {
        const waBtn = document.getElementById("waBtn");
        const contactBtn = document.getElementById("contactBtn");
        const backBtn = document.getElementById("backToLoginLink");
        const demoBtn = document.getElementById("viewDemoLink");

        waBtn?.addEventListener("click", () => {
          window.open(WHATSAPP_URL, "_blank", "noopener,noreferrer");
        });
        contactBtn?.addEventListener("click", () => {
          Swal.close();
          setContactOpen(true); // <-- opens the modal
        });
        backBtn?.addEventListener("click", (e) => {
          e.preventDefault();
          Swal.close();
        });
        demoBtn?.addEventListener("click", (e) => {
          e.preventDefault();
          Swal.close();
          router.push("/demo");
        });
      },
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setShowDemoOption(false);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, remember }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.status === "rejected") {
          setShowDemoOption(true);
          await showAccessDeniedAlert();
          return;
        }

        if (data.status === "pending") {
          setShowDemoOption(true);
          await Swal.fire({
            icon: "info",
            title: "Awaiting approval",
            text: data.message || "Your account is pending admin approval.",
            confirmButtonColor: "#0E7C4A",
          });
          return;
        }

        await Swal.fire({
          icon: "error",
          title: "Login failed",
          text: data.message || "Something went wrong.",
          confirmButtonColor: "#0E7C4A",
        });
        return;
      }

      await Swal.fire({
        icon: "success",
        title: "Welcome back!",
        text: "Logged in successfully.",
        confirmButtonColor: "#0E7C4A",
        timer: 1200,
        showConfirmButton: false,
      });

      await refresh();
      router.push("/dashboard");
    } catch {
      await Swal.fire({
        icon: "error",
        title: "Network error",
        text: "Could not reach the server. Please try again.",
        confirmButtonColor: "#0E7C4A",
      });
      setShowDemoOption(true);
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
          <h1 className="font-display text-2xl font-bold text-ink">Log in</h1>
          <p className="text-ink/60 text-sm mt-1">Access your ledger</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-ink/10 p-6 space-y-4">
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
          <div>
            <label className="block text-sm font-medium text-ink/80 mb-1">Password</label>
            <PasswordInput
              value={password}
              onChange={setPassword}
              required
              autoComplete="current-password"
              placeholder="••••••••"
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-ink/70 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="rounded border-ink/30 text-primary focus:ring-primary/40"
              />
              Remember me
            </label>
            <Link href="/forgot-password" className="text-primary font-medium hover:underline">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 rounded-lg bg-primary text-white font-semibold hover:bg-primary-dark transition-colors disabled:opacity-60"
          >
            {submitting ? "Logging in…" : "Log in"}
          </button>

          {showDemoOption && (
            <Link
              href="/demo"
              className="block text-center w-full py-2.5 rounded-lg border border-ink/15 text-ink font-semibold hover:bg-ink/5 transition-colors"
            >
              View demo instead
            </Link>
          )}
        </form>

        <p className="text-center text-sm text-ink/60 mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-primary font-semibold hover:underline">
            Register
          </Link>
        </p>
        <p className="text-center text-sm mt-2">
          <Link href="/demo" className="text-ink/50 hover:text-ink transition-colors">
            👀 View demo →
          </Link>
        </p>
      </div>

      {/* Contact Us Modal — controlled by contactOpen state */}
      <ContactUsModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </main>
  );
}