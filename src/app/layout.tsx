import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import WhatsAppButton from "@/components/WhatsAppButton";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

import { siteUrl, siteName, OG_IMAGE_PATH } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} — Track money in and out, without the guesswork`,
    template: `%s | ${siteName}`,
  },
  description:
    "EasyCash is a simple ledger for tracking income, expenses, and site payments — with admin-approved accounts to keep your books private.",
  keywords: ["cash ledger", "expense tracker", "income tracker", "site payments", "EasyCash"],
  applicationName: siteName,

  verification: {
    google: "7XniJcyvtP_kmPjzHiCQreIgxDm_blEkGLkCskk0oxM",
  },

  // appleWebApp: makes iOS treat an "Add to Home Screen" install as a real
  // standalone app (hides Safari's address bar/toolbar) instead of just a
  // bookmark shortcut, and sets the name shown under the Home Screen icon.
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: siteName,
  },

  icons: {
    icon: [
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    // Dedicated 180x180 apple-touch-icon (no rounded corners/transparency —
    // iOS applies its own corner rounding) instead of reusing icon-192,
    // which is sized/shaped for Android/desktop, not iOS's Home Screen grid.
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName,
    title: `${siteName} — Track money in and out, without the guesswork`,
    description:
      "A simple, approval-gated ledger for tracking income, expenses, and site payments.",
    images: [{ url: OG_IMAGE_PATH, width: 1200, height: 630, alt: siteName }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} — Track money in and out, without the guesswork`,
    description:
      "A simple, approval-gated ledger for tracking income, expenses, and site payments.",
    images: [OG_IMAGE_PATH],
  },
  robots: {
    index: true,
    follow: true,
  },
};

// themeColor moved here from `metadata` — Next.js 14+ requires it in a
// separate `viewport` export rather than inside `metadata.themeColor`.
export const viewport: Viewport = {
  themeColor: "#0E7C4A",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable}`}>
      <body className="font-body antialiased">
        <AuthProvider>{children}</AuthProvider>
        <WhatsAppButton />
        <Analytics />
      </body>
    </html>
  );
}
