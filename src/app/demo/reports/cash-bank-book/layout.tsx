import type { Metadata } from "next";
import { buildPageMetadata, JsonLd, webPageJsonLd } from "@/lib/seo";

const page = {
  title: "Cash and Bank Book Report Demo",
  description: "Preview the combined cash and bank book report in EasyCash, with sample cash book and journal voucher entries.",
  path: "/demo/reports/cash-bank-book",
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
