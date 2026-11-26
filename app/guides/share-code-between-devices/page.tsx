import type { Metadata } from "next";
import Link from "next/link";

import { ContentPage } from "@/components/content-page";

export const metadata: Metadata = {
  title: "Move a Code Snippet Between Devices",
  description:
    "A step-by-step way to move a small code snippet from one device to another with a temporary link, six-digit code, or QR scan.",
  alternates: { canonical: "/guides/share-code-between-devices" },
};

export default function ShareCodeGuidePage() {
  return (
    <ContentPage
      actions={<Link className="primary-link" href="/#composer">Create a code share</Link>}
      intro="When a snippet is on the wrong screen, a short-lived share can move it without setting up a repository or collaboration workspace."
      title="Move a code snippet between devices."
    >
      <section className="policy-section">
        <h2>Before you paste</h2>
        <p>
          Remove anything the recipient does not need. Code often contains values that look harmless
          in a demo but are actually credentials: API keys, access tokens, private URLs, customer
          identifiers, or database connection strings. Blinkport is a public-link utility, not a
          secret manager. Do not paste passwords, production secrets, or regulated personal data.
        </p>
      </section>

      <section className="policy-section">
        <h2>Send the snippet</h2>
        <ol className="content-list">
          <li>Open Blinkport on the device that currently has the snippet.</li>
          <li>Choose code mode, select the language if useful, and paste the smallest relevant example.</li>
          <li>Create the share, then keep the page open while you pass the access method to the other device.</li>
          <li>On the receiving device, either enter the six-digit code on Blinkport or scan the QR code to open the share directly.</li>
          <li>Copy the code from the readable view, or use the browser&apos;s copy control if available.</li>
        </ol>
        <p>
          The QR route is the quickest option when both screens are nearby. The six-digit code is
          useful when you are describing the handoff over a call or entering it on a separate screen.
        </p>
      </section>

      <section className="policy-section">
        <h2>Keep the handoff temporary</h2>
        <p>
          A share expires 10 minutes after creation. Anyone who gets the code or QR link can access
          it during that window, so send the access method only to the intended recipient. Blinkport
          does not keep a history page for reopening expired shares. If the content is still needed
          later, create a new share from the source instead of relying on an old link.
        </p>
      </section>

      <section className="policy-section">
        <h2>If something goes wrong</h2>
        <p>
          Check that all six digits were entered and that the share has not expired. If the snippet
          is large, remove unrelated files or generated output and try again. For durable team review
          or version history, use a private repository or collaboration tool rather than a temporary
          paste.
        </p>
        <p><Link href="/help">Visit the help center</Link> for more answers.</p>
      </section>
    </ContentPage>
  );
}
