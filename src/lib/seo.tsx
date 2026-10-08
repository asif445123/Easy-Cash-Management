import type { Metadata } from "next";

/**
 * Central SEO helpers. Server-only (no hooks), used by route layouts and
 * the root layout. Nothing here renders visible UI — JsonLd emits an
 * invisible <script type="application/ld+json">.
 */

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://easycash.example.com").replace(/\/+$/, "");
export const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "EasyCash";

export const OG_IMAGE_PATH = "/og-image.png";
export const DEFAULT_TITLE = `${siteName} — Track money in and out, without the guesswork`;

export interface PageSeo {
  /** Page-specific title. The root layout template appends " | EasyCash". */
  title: string;
  description: string;
  /** Path relative to the site root, e.g. "/demo/dashboard". */
  path: string;
  /** Use for pages that should not appear in search results. */
  noindex?: boolean;
}

/** Metadata for an indexable or noindex public page (canonical, OG, Twitter). */
export function buildPageMetadata({ title, description, path, noindex = false }: PageSeo): Metadata {
  const ogTitle = `${title} | ${siteName}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    robots: noindex ? { index: false, follow: true } : { index: true, follow: true },
    openGraph: {
      type: "website",
      url: path,
      siteName,
      title: ogTitle,
      description,
      images: [{ url: OG_IMAGE_PATH, width: 1200, height: 630, alt: siteName }],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description,
      images: [OG_IMAGE_PATH],
    },
  };
}

/** Metadata that only sets crawl directives (private / auth pages). */
export const noindexMetadata: Metadata = {
  robots: { index: false, follow: false },
};

/** Renders a JSON-LD block. Invisible to users. */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

export function webPageJsonLd({ title, description, path }: PageSeo) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description,
    url: `${siteUrl}${path}`,
    isPartOf: { "@type": "WebSite", name: siteName, url: `${siteUrl}/` },
  };
}
