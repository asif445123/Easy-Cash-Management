import type { Metadata } from "next";
import { noindexMetadata } from "@/lib/seo";

// Token-based password reset page: private, never indexed.
export const metadata: Metadata = noindexMetadata;

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
