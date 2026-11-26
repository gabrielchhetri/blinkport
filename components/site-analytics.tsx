"use client";

import { Analytics, type BeforeSendEvent } from "@vercel/analytics/next";

function sanitizeAnalyticsEvent(event: BeforeSendEvent): BeforeSendEvent | null {
  const url = new URL(event.url, window.location.origin);

  if (/^\/api(?:\/|$)/i.test(url.pathname)) return null;

  if (/^\/p\/[^/]+(?:\/|$)/i.test(url.pathname)) {
    url.pathname = "/p/share";
  }

  url.search = "";
  url.hash = "";

  return { ...event, url: url.toString() };
}

export function SiteAnalytics() {
  return <Analytics beforeSend={sanitizeAnalyticsEvent} />;
}
