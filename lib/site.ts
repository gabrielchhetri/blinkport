export const siteName = "Blinkport";
export const siteTagline = "The short route between devices.";
export const siteDescription =
  "Blinkport is a lightweight web tool for temporarily sharing text, code snippets, and files up to 5 MB for 10 minutes with 6-digit access codes, QR access, readable views, and straightforward downloads.";
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
export const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "support@blinkport.app";
export const companyName = process.env.NEXT_PUBLIC_COMPANY_NAME ?? "Blinkport";

export const primaryNav = [
  { href: "/", label: "Home" },
  { href: "/tools", label: "Tools" },
  { href: "/about", label: "About" },
  { href: "/help", label: "Help" },
] as const;

export const footerNav = [
  { href: "/tools", label: "Tools" },
  { href: "/guides", label: "Guides" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/about", label: "About" },
  { href: "/help", label: "Help" },
  { href: "/contact", label: "Contact" },
] as const;

export function buildSiteJsonLd() {
  return [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: companyName,
      url: siteUrl,
      email: supportEmail,
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: siteName,
      url: siteUrl,
      description: siteDescription,
    },
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: siteName,
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Web",
      description: siteDescription,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      featureList: [
        "Share text notes and code snippets between devices",
        "Share code snippets with line-numbered reading views",
        "Upload small files up to 5 MB",
        "Open shares with a six-digit code or QR code",
        "Automatically remove shares after ten minutes",
        "Format JSON, compare text, and count words in the browser without creating a share",
      ],
      url: siteUrl,
    },
  ];
}

export const utilityTools = [
  {
    href: "/tools/json-formatter",
    name: "JSON formatter",
    summary: "Format, minify, and validate JSON while you work.",
  },
  {
    href: "/tools/text-diff",
    name: "Text diff checker",
    summary: "Compare two versions line by line and spot what changed.",
  },
  {
    href: "/tools/word-counter",
    name: "Word counter",
    summary: "Count words, characters, spaces, and lines as you type.",
  },
] as const;
