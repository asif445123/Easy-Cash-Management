import { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://easycash.example.com";

type ChangeFrequency = NonNullable<
  MetadataRoute.Sitemap[number]["changeFrequency"]
>;

interface PublicRoute {
  path: string;
  changeFrequency: ChangeFrequency;
  priority: number;
}

// Public, crawlable pages only. Auth-protected areas (/dashboard, /admin/*),
// the API (/api/*), /settings, and token-based /reset-password/* are
// intentionally excluded — they are disallowed in robots.ts.
const publicRoutes: PublicRoute[] = [
  { path: "", changeFrequency: "weekly", priority: 1 },
  { path: "/login", changeFrequency: "monthly", priority: 0.8 },
  { path: "/register", changeFrequency: "monthly", priority: 0.8 },
  { path: "/forgot-password", changeFrequency: "monthly", priority: 0.5 },

  // Demo — no account required
  { path: "/demo", changeFrequency: "weekly", priority: 0.9 },
  { path: "/demo/dashboard", changeFrequency: "weekly", priority: 0.7 },

  // Demo — Add Entry screens
  { path: "/demo/account-types", changeFrequency: "weekly", priority: 0.6 },
  { path: "/demo/accounts-master", changeFrequency: "weekly", priority: 0.6 },
  { path: "/demo/cash-book", changeFrequency: "weekly", priority: 0.6 },
  { path: "/demo/electricity-bill", changeFrequency: "weekly", priority: 0.6 },
  { path: "/demo/journal-voucher", changeFrequency: "weekly", priority: 0.6 },
  { path: "/demo/motorcycle", changeFrequency: "weekly", priority: 0.6 },

  // Demo — Reports
  { path: "/demo/reports/account-ledger", changeFrequency: "weekly", priority: 0.6 },
  { path: "/demo/reports/accounts-list", changeFrequency: "weekly", priority: 0.6 },
  { path: "/demo/reports/cash-bank-book", changeFrequency: "weekly", priority: 0.6 },
  { path: "/demo/reports/electricity-bill", changeFrequency: "weekly", priority: 0.6 },
  { path: "/demo/reports/journal-voucher", changeFrequency: "weekly", priority: 0.6 },
  { path: "/demo/reports/month-comparison", changeFrequency: "weekly", priority: 0.6 },
  { path: "/demo/reports/month-wise", changeFrequency: "weekly", priority: 0.6 },
  { path: "/demo/reports/motorcycle", changeFrequency: "weekly", priority: 0.6 },
  { path: "/demo/reports/receivable-payable", changeFrequency: "weekly", priority: 0.6 },
  { path: "/demo/reports/trial-balance-2", changeFrequency: "weekly", priority: 0.6 },
  { path: "/demo/reports/trial-balance-6", changeFrequency: "weekly", priority: 0.6 },
  { path: "/demo/reports/year-comparison", changeFrequency: "weekly", priority: 0.6 },
  { path: "/demo/reports/year-wise", changeFrequency: "weekly", priority: 0.6 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return publicRoutes.map((route) => ({
    url: `${siteUrl}${route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
