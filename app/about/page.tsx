import type { Metadata } from "next";
import Link from "next/link";

import { ContentPage } from "@/components/content-page";

export const metadata: Metadata = {
  title: "About Blinkport",
  description:
    "Learn what Blinkport is, who it serves, and how the product is designed for temporary 10-minute text, code, and file sharing.",
  alternates: {
    canonical: "/about",
  },
};

export default function AboutPage() {
  return (
    <ContentPage
      actions={
        <>
          <Link className="primary-link" href="/#composer">
            Create a paste
          </Link>
          <Link className="secondary-link" href="/contact">
            Contact support
          </Link>
        </>
      }
      intro="Blinkport exists to solve a simple but recurring problem: getting a small piece of text, code, or file content from one screen to another without unnecessary friction."
      title="A focused utility for fast cross-device sharing."
    >
      <section className="content-grid">
        <article className="content-card">
          <h2>Why it exists</h2>
          <p>
            There are many moments in work where you do not need a full collaboration suite. You
            just need a dependable link for a note, a snippet, or a small file. Blinkport is built
            for those handoff moments.
          </p>
        </article>
        <article className="content-card">
          <h2>Who it serves</h2>
          <p>
            Developers, operators, support teams, QA staff, founders, and anyone moving lightweight
            content between desktop and mobile devices can use Blinkport as a simple relay tool.
          </p>
        </article>
        <article className="content-card">
          <h2>Product scope</h2>
          <p>
            Blinkport is intentionally narrow. It supports text, code, and files up to 5 MB, plus
            temporary 10-minute access through a 6-digit code or QR route. It does not try to
            become a full document platform or cloud drive.
          </p>
        </article>
      </section>

      <section className="policy-section">
        <h2>Core principles</h2>
        <ul className="content-list">
          <li>Readable output matters more than visual clutter.</li>
          <li>Small file transfers should feel immediate and predictable.</li>
          <li>Temporary storage is clearer and safer for quick handoff workflows.</li>
          <li>Visitors should be able to understand the service from its public pages alone.</li>
          <li>Trust signals like contact, privacy, terms, and help content should be easy to find.</li>
        </ul>
      </section>

      <section className="policy-section">
        <h2>How the site builds trust</h2>
        <p>
          Beyond the homepage, Blinkport includes support, legal, and product explanation pages so
          users and reviewers can understand what the tool does, how public links behave, and where
          to reach the operator.
        </p>
      </section>
    </ContentPage>
  );
}
