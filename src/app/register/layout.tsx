import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

// noindex: keeps this page out of search results. It is not in the sitemap.
export const metadata: Metadata = buildPageMetadata({
  title: "Create an account",
  description: "Request an EasyCash account. New accounts need admin approval before they can log in.",
  path: "/register",
  noindex: true,
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
