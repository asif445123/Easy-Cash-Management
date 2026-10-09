import type { Metadata } from "next";
import { buildPageMetadata, JsonLd, webPageJsonLd } from "@/lib/seo";

const page = {
  title: "Receivable and Payable Report Demo",
  description: "Preview the EasyCash receivable and payable report showing who owes you and whom you owe, using sample data.",
  path: "/demo/reports/receivable-payable",
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
