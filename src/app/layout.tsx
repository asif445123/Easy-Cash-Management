import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://easycash.example.com";
const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "EasyCash";

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
  icons: {
    icon: [
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/icon-192.png",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName,
    title: `${siteName} — Track money in and out, without the guesswork`,
    description:
      "A simple, approval-gated ledger for tracking income, expenses, and site payments.",
    images: [{ url: "/icon-512.png", width: 512, height: 512, alt: siteName }],
  },
  twitter: {
    card: "summary",
    title: `${siteName} — Track money in and out, without the guesswork`,
    description:
      "A simple, approval-gated ledger for tracking income, expenses, and site payments.",
    images: ["/icon-512.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable}`}>
      <body className="font-body antialiased">
        <AuthProvider>{children}</AuthProvider>
        <WhatsAppButton />
      </body>
    </html>
  );
}
