import type { Metadata } from "next";

import { ContentPage } from "@/components/content-page";
import { supportEmail } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Use",
  description:
    "Read the Blinkport terms of use, including 10-minute share limits, temporary-access expectations, acceptable use, and prohibited content.",
  alternates: {
    canonical: "/terms",
  },
};

export default function TermsPage() {
  return (
    <ContentPage
      intro="These terms explain how the service may be used, what the operator expects from visitors, and what kinds of content are not allowed."
      title="Terms of use for Blinkport."
    >
      <section className="policy-section">
        <h2>Acceptable use</h2>
        <ul className="content-list">
          <li>Use the service for lawful text, code, and lightweight file sharing.</li>
          <li>Do not upload malware, illegal content, deceptive material, or abusive payloads.</li>
          <li>Do not use the service to harass, impersonate, or harm other people.</li>
          <li>Do not attempt to overload, scrape, or misuse the site infrastructure.</li>
        </ul>
      </section>

      <section className="policy-section">
        <h2>Temporary-access expectation</h2>
        <p>
          Blinkport is a temporary-access utility. If you share the 6-digit code or QR route, other
          people who obtain them may be able to access the content during the active 10-minute
          window.
        </p>
      </section>

      <section className="policy-section">
        <h2>Service limits</h2>
        <p>
          The product currently limits uploads to 5 MB and is designed for lightweight transfer
          work, not bulk hosting or permanent archival storage. Expired shares are not meant to be
          reopened.
        </p>
      </section>

      <section className="policy-section">
        <h2>Questions</h2>
        <p>
          Terms questions or abuse reports can be sent to <a href={`mailto:${supportEmail}`}>{supportEmail}</a>.
        </p>
      </section>
    </ContentPage>
  );
}
