import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

// noindex: keeps this page out of search results. It is not in the sitemap.
export const metadata: Metadata = buildPageMetadata({
  title: "Forgot password",
  description: "Reset your EasyCash password. Enter your account email and we will send a reset link.",
  path: "/forgot-password",
  noindex: true,
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
