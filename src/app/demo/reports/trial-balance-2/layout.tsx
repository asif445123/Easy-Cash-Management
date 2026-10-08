import type { Metadata } from "next";
import { buildPageMetadata, JsonLd, webPageJsonLd } from "@/lib/seo";

const page = {
  title: "Trial Balance (2 Column) Demo",
  description: "Preview a two-column debit and credit trial balance in EasyCash, using sample data.",
  path: "/demo/reports/trial-balance-2",
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
