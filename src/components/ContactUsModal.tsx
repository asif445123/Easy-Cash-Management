"use client";

import { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { safeJson } from "@/lib/api-client";
import { useAuth } from "@/context/AuthContext";

interface ContactUsModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ContactUsModal({ open, onClose }: ContactUsModalProps) {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pre-fill from the logged-in user each time the modal opens, so
  // there's nothing to retype — still editable in case someone's
  // reaching out on behalf of a different name/email.
  useEffect(() => {
    if (open && user) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
  }, [open, user]);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      const data = await safeJson(res);
      if (!res.ok) {
        setError(data.message || "Could not send your message.");
        return;
      }
      setSent(true);
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setSending(false);
    }
  }

  function handleClose() {
    onClose();
    // Reset a moment after close so the form doesn't visibly clear mid-fade.
    setTimeout(() => {
      setName("");
      setEmail("");
      setMessage("");
      setSent(false);
      setError(null);
    }, 200);
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
        <button
          onClick={handleClose}
          aria-label="Close"
          className="absolute top-5 right-5 text-ink/40 hover:text-ink transition-colors"
        >
          <FaTimes size={18} />
        </button>

        {sent ? (
          <div className="py-6 text-center">
            <h2 className="font-display text-xl font-bold text-ink mb-2">Message sent!</h2>
            <p className="text-sm text-ink/60 mb-6">
              Thanks for reaching out — we'll get back to you soon.
            </p>
            <button
              onClick={handleClose}
              className="px-5 py-2.5 rounded-lg bg-primary text-white font-semibold hover:bg-primary-dark transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <h2 className="font-display text-xl font-bold text-ink mb-6 pr-6">
              We'd love to hear from you. Send us a message!
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink/80 mb-1">
                  Full Name <span className="text-danger">*</span>
                </label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-ink/15 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink/80 mb-1">
                  Email Address <span className="text-danger">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-ink/15 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink/80 mb-1">
                  Message <span className="text-danger">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message here…"
                  className="w-full rounded-lg border border-ink/15 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                />
              </div>

              {error && <p className="text-sm text-danger">{error}</p>}

              <div className="border-t border-ink/10 pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-5 py-2.5 rounded-lg border border-ink/15 text-ink/70 font-semibold hover:bg-ink/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sending}
                  className="px-5 py-2.5 rounded-lg bg-primary text-white font-semibold hover:bg-primary-dark transition-colors disabled:opacity-60"
                >
                  {sending ? "Sending…" : "Send Message"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
