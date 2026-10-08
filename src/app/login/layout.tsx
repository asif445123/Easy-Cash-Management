import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

// noindex: keeps this page out of search results. It is not in the sitemap.
export const metadata: Metadata = buildPageMetadata({
  title: "Log in",
  description: "Log in to your approved EasyCash account to view your cash book, ledger, and reports.",
  path: "/login",
  noindex: true,
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
