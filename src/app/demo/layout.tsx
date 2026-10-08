import type { Metadata } from "next";
import { buildPageMetadata, siteName } from "@/lib/seo";

// Shared demo metadata. Each /demo/* route has its own layout.tsx that
// overrides title, description, canonical and Open Graph.
// The title template is declared here too, so child routes (each with a
// plain-string title) still get the " | EasyCash" suffix.
const demoMetadata = buildPageMetadata({
  title: "Interactive Demo with Sample Data",
  description:
    "Explore EasyCash with sample data before creating an account. Preview the cash book, journal vouchers, account types, and reports.",
  path: "/demo",
});

export const metadata: Metadata = {
  ...demoMetadata,
  title: { default: "Interactive Demo with Sample Data", template: `%s | ${siteName}` },
};

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
