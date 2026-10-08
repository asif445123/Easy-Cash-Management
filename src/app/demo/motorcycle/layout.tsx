import type { Metadata } from "next";
import { buildPageMetadata, JsonLd, webPageJsonLd } from "@/lib/seo";

const page = {
  title: "Motorcycle Expense Tracking Demo",
  description: "Preview motorcycle odometer readings and fuel, mobile and tuning costs in EasyCash, using sample data.",
  path: "/demo/motorcycle",
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
