import type { Metadata } from "next";
import { buildPageMetadata, JsonLd, webPageJsonLd } from "@/lib/seo";

const page = {
  title: "Chart of Accounts Demo",
  description:
    "Preview the EasyCash chart of accounts — assets, liabilities, equity, income and expenses grouped by account type with opening balances.",
  path: "/demo/chart-of-accounts",
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
