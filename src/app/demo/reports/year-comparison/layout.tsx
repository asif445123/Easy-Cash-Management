import type { Metadata } from "next";
import { buildPageMetadata, JsonLd, webPageJsonLd } from "@/lib/seo";

const page = {
  title: "Year Wise Comparison Report Demo",
  description: "Preview the EasyCash year wise comparison report, which compares two years side by side, using sample data.",
  path: "/demo/reports/year-comparison",
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
