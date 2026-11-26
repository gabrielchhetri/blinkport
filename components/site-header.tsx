import Link from "next/link";

import { SamePageReloadLink } from "@/components/same-page-reload-link";
import { primaryNav, siteName, siteTagline } from "@/lib/site";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="shell shell-chrome header-inner">
        <SamePageReloadLink className="brand-mark" href="/">
          <span aria-hidden="true" className="brand-badge">b</span>
          <span className="brand-copy">
            <strong>{siteName}</strong>
            <small>{siteTagline}</small>
          </span>
        </SamePageReloadLink>

        <nav aria-label="Primary" className="site-nav">
          {primaryNav.map((item) => (
            <SamePageReloadLink key={item.href} className="nav-link" href={item.href}>
              {item.label}
            </SamePageReloadLink>
          ))}
        </nav>

        <Link className="primary-link header-cta" href="/#composer">
          Make a share
        </Link>
      </div>
    </header>
  );
}
