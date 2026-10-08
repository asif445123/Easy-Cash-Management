import type { Metadata } from "next";
import { buildPageMetadata, JsonLd, webPageJsonLd } from "@/lib/seo";

const page = {
  title: "Year Wise Report Demo",
  description: "Preview the EasyCash year wise report showing income and expenses per year, using sample data.",
  path: "/demo/reports/year-wise",
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
