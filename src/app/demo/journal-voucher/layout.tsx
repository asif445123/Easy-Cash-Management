import type { Metadata } from "next";
import { buildPageMetadata, JsonLd, webPageJsonLd } from "@/lib/seo";

const page = {
  title: "Journal Voucher Demo",
  description: "Preview EasyCash journal vouchers for recording general entries between accounts, using sample data.",
  path: "/demo/journal-voucher",
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
