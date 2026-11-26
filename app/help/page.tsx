import type { Metadata } from "next";
import Link from "next/link";

import { ContentPage } from "@/components/content-page";

export const metadata: Metadata = {
  title: "Help Center",
  description:
    "Read practical help for using Blinkport, including how 10-minute shares, 6-digit codes, QR access, and file limits work.",
  alternates: {
    canonical: "/help",
  },
};

export default function HelpPage() {
  return (
    <ContentPage
      actions={
        <>
          <Link className="primary-link" href="/#composer">
            Start a paste
          </Link>
          <Link className="secondary-link" href="/privacy">
            Privacy details
          </Link>
        </>
      }
      intro="This help center explains how Blinkport works in straightforward language so visitors can use the product with confidence."
      title="Simple answers for a simple sharing workflow."
    >
      <section className="content-grid">
        <article className="content-card">
          <h2>Create a note or snippet</h2>
          <p>
            Choose the mode that matches your content, add a title if helpful, paste the content,
            and submit. The service returns a temporary share that exposes a 6-digit code and a QR
            route for the other device.
          </p>
        </article>
        <article className="content-card">
          <h2>Share a small file</h2>
          <p>
            Upload a file up to 5 MB and optionally include a note for context. Files are served as
            downloads rather than inline previews, and the share expires after 10 minutes.
          </p>
        </article>
        <article className="content-card">
          <h2>Use the right page</h2>
          <p>
            Marketing and policy pages explain the product. Individual paste pages are utility pages
            for shared content, not the main destination for search discovery.
          </p>
        </article>
      </section>

      <section className="policy-section">
        <h2>Step-by-step guides</h2>
        <ul className="content-list">
          <li><Link href="/guides/share-code-between-devices">Move a code snippet between devices</Link></li>
          <li><Link href="/guides/send-a-file-to-another-device">Send a small file to another device</Link></li>
          <li><Link href="/guides/temporary-sharing-and-privacy">Understand temporary sharing and expiry</Link></li>
        </ul>
      </section>

      <section className="policy-section">
        <h2>Common questions</h2>
        <div className="faq-list">
          <details className="faq-item">
            <summary>How long does a share last?</summary>
            <p>Each share is temporary and is automatically removed after 10 minutes.</p>
          </details>
          <details className="faq-item">
            <summary>How does the receiver open a share?</summary>
            <p>They can type the 6-digit code on the homepage or scan the QR code generated for that share.</p>
          </details>
          <details className="faq-item">
            <summary>Can I upload anything?</summary>
            <p>
              Keep uploads legal, safe, and lightweight. The terms page explains prohibited content
              and misuse cases.
            </p>
          </details>
        </div>
      </section>
    </ContentPage>
  );
}
