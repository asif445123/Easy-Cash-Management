import type { Metadata } from "next";
import { buildPageMetadata, JsonLd, webPageJsonLd } from "@/lib/seo";

const page = {
  title: "Trial Balance (6 Column) Demo",
  description: "Preview an extended six-column trial balance with openings and adjustments in EasyCash, using sample data.",
  path: "/demo/reports/trial-balance-6",
};

export const metadata: Metadata = buildPageMetadata(page);

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={webPageJsonLd(page)} />
      {children}
    </>
  );
}
