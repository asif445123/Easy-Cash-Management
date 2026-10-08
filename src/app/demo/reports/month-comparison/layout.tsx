import type { Metadata } from "next";
import { buildPageMetadata, JsonLd, webPageJsonLd } from "@/lib/seo";

const page = {
  title: "Month Wise Comparison Report Demo",
  description: "Preview the EasyCash month wise comparison report, which compares two months side by side, using sample data.",
  path: "/demo/reports/month-comparison",
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
