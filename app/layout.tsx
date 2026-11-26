import type { Metadata } from "next";
import type { ReactNode } from "react";
import localFont from "next/font/local";

import { SiteAnalytics } from "@/components/site-analytics";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ToastProvider } from "@/components/toast-provider";
import { buildSiteJsonLd, siteDescription, siteName, siteUrl } from "@/lib/site";

import "./globals.css";

const uiFont = localFont({
  src: "../public/fonts/dm-sans-latin.woff2",
  variable: "--font-ui",
  display: "swap",
  weight: "400 700",
});

const displayFont = localFont({
  src: "../public/fonts/newsreader-latin.woff2",
  variable: "--font-display",
  display: "swap",
  weight: "400 600",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} | Share Text, Code, and Small Files Across Devices`,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  applicationName: siteName,
  category: "developer tools",
  alternates: {
    canonical: "/",
  },
  keywords: [
    "pastebin alternative",
    "share code snippets",
    "share text online",
    "small file sharing",
    "cross-device paste tool",
    "developer sharing tool",
  ],
  openGraph: {
    title: `${siteName} | Share Text, Code, and Small Files Across Devices`,
    description: siteDescription,
    siteName,
    type: "website",
    url: siteUrl,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: `${siteName} preview`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} | Share Text, Code, and Small Files Across Devices`,
    description: siteDescription,
    images: ["/twitter-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html className={[uiFont.variable, displayFont.variable].join(" ")} lang="en">
      <body>
        <a className="skip-link" href="#main-content">Skip to content</a>
        <script
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(buildSiteJsonLd()),
          }}
          type="application/ld+json"
        />
        <ToastProvider>
          <div className="site-frame">
            <SiteHeader />
            <div className="page-slot">{children}</div>
            <SiteFooter />
          </div>
        </ToastProvider>
        <SiteAnalytics />
      </body>
    </html>
  );
}
