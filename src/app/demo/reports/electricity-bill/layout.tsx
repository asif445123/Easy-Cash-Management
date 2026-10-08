import type { Metadata } from "next";
import { buildPageMetadata, JsonLd, webPageJsonLd } from "@/lib/seo";

const page = {
  title: "Electricity Bill Report Demo",
  description: "Preview the EasyCash electricity bill report, comparing bills with meter readings and cost per unit, using sample data.",
  path: "/demo/reports/electricity-bill",
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
