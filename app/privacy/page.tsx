import type { Metadata } from "next";

import { ContentPage } from "@/components/content-page";
import { supportEmail } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Read the Blinkport privacy policy covering temporary 10-minute shares, uploaded files, operational logs, and how to contact the site operator.",
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <ContentPage
      intro="This privacy policy describes the information handled by Blinkport and the practical limits of a public paste-sharing service."
      title="Privacy information for a public-link sharing tool."
    >
      <section className="policy-section">
        <h2>Temporary share content</h2>
        <p>
          Pastes and uploaded files are intended for temporary sharing. During the 10-minute window,
          anyone with the 6-digit code or direct QR route may be able to access that content, so
          the service should not be used for secrets, passwords, regulated data, or sensitive
          personal information.
        </p>
      </section>

      <section className="policy-section">
        <h2>Information the service stores</h2>
        <ul className="content-list">
          <li>Paste titles, text content, mode, timestamps, and file metadata.</li>
          <li>Uploaded files for the purpose of serving them back through their public links.</li>
          <li>Basic operational information that may be needed for hosting, debugging, or abuse handling.</li>
        </ul>
        <p>
          In production, share records and file bytes are held in Upstash Redis with a 10-minute
          expiration. Local development keeps active shares in server memory and clears them when
          they expire or the development process restarts. This describes Blinkport&apos;s application
          storage; hosting and network providers may process separate operational logs.
        </p>
        <p>
          For abuse prevention, Blinkport hashes the client address supplied by its trusted proxy
          and uses that hash for rate limiting. Rate-limit counters expire after one minute; the
          raw address is not stored in a share record. Hosting providers may maintain their own
          network logs under their own policies.
        </p>
        <p>
          Blinkport uses Vercel Web Analytics to measure aggregate site traffic. Analytics may
          process page-view timestamps, page paths, referring origins, approximate location, and
          browser and device information. Before sending events, Blinkport removes query strings
          and fragments, replaces unique share paths with a generic path, and excludes API routes.
          The site also uses an origin-only referrer policy so page paths are not sent as referrer
          information.
        </p>
        <p>
          Vercel states that Web Analytics does not use cookies and uses a visitor hash that resets
          within 24 hours. See the{" "}
          <a href="https://vercel.com/docs/analytics/privacy-policy">Vercel Web Analytics privacy details</a>.
          Blinkport does not currently display ads or use analytics for advertising or cross-site
          ad targeting.
        </p>
      </section>

      <section className="policy-section">
        <h2>How data is used</h2>
        <p>
          Data is used to create and serve temporary paste pages, support file downloads during the
          active share window, maintain service performance, and respond to misuse or support requests.
        </p>
      </section>

      <section className="policy-section">
        <h2>Contact</h2>
        <p>
          Privacy questions can be sent to <a href={`mailto:${supportEmail}`}>{supportEmail}</a>.
        </p>
      </section>
    </ContentPage>
  );
}
