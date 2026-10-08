import type { Metadata } from "next";
import { buildPageMetadata, JsonLd, webPageJsonLd } from "@/lib/seo";

const page = {
  title: "Motorcycle Report Demo",
  description: "Preview the EasyCash motorcycle report with sample kilometres driven, fuel cost per km, and mobile and tuning spend against limits.",
  path: "/demo/reports/motorcycle",
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
