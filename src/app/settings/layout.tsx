import type { Metadata } from "next";
import { noindexMetadata } from "@/lib/seo";

// Private, login-only account settings: never indexed.
export const metadata: Metadata = noindexMetadata;

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
