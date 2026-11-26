import Link from "next/link";

import { footerNav, siteName, siteTagline, supportEmail } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell shell-chrome footer-grid">
        <div className="footer-intro">
          <h2>{siteTagline}</h2>
          <p>
            Move a note, code snippet, or small file to another device. Shares expire after ten
            minutes, and there is no history to reopen.
          </p>
        </div>

        <div className="footer-links">
          {footerNav.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </div>

        <div className="footer-contact">
          <p className="eyebrow">Contact</p>
          <a href={`mailto:${supportEmail}`}>{supportEmail}</a>
          <p className="footer-note">Questions, policy requests, or support issues can be sent here.</p>
        </div>
      </div>

      <div className="shell shell-chrome footer-bottom">
        <p>
          Copyright {new Date().getFullYear()} {siteName}. Temporary share pages auto-expire, and
          policy pages explain how the service works.
        </p>
      </div>
    </footer>
  );
}
