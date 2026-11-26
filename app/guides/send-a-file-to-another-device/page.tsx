import type { Metadata } from "next";
import Link from "next/link";

import { ContentPage } from "@/components/content-page";

export const metadata: Metadata = {
  title: "Send a Small File to Another Device",
  description:
    "Learn how to transfer a file up to 5 MB with Blinkport's temporary file share, six-digit code, QR access, and attachment download.",
  alternates: { canonical: "/guides/send-a-file-to-another-device" },
};

export default function SendFileGuidePage() {
  return (
    <ContentPage
      actions={<Link className="primary-link" href="/#composer">Share a file</Link>}
      intro="A small file can be awkward to move when you are switching between a phone, tablet, and computer. This guide covers the short transfer workflow and its limits."
      title="Send a small file to another device."
    >
      <section className="policy-section">
        <h2>Check the file first</h2>
        <p>
          Blinkport accepts files up to 5 MB. Confirm that you selected the right file and that it
          does not contain private information the recipient should not see. A temporary link is
          convenient, but it is not an access-controlled file vault: anyone who obtains the share
          route or its six-digit code may be able to retrieve the file before expiry.
        </p>
      </section>

      <section className="policy-section">
        <h2>Upload and retrieve</h2>
        <ol className="content-list">
          <li>On the sending device, choose file mode and select a file no larger than 5 MB.</li>
          <li>Create the share and use its QR code or six-digit access code on the receiving device.</li>
          <li>Open the share page and choose the download action to save the file on that device.</li>
          <li>Check the downloaded file before closing the page, especially if the browser renamed it.</li>
        </ol>
        <p>
          Files are delivered as downloads rather than opened as inline previews. This makes the
          handoff predictable across file types, but the receiving device still needs a suitable app
          to open the downloaded file.
        </p>
      </section>

      <section className="policy-section">
        <h2>What happens after ten minutes</h2>
        <p>
          The share is available for 10 minutes from creation. After expiry, Blinkport no longer
          serves the share from its temporary application storage, and there is no share history to
          reopen. Expiry cannot remove a copy that the recipient already downloaded, moved, or
          backed up on their own device.
        </p>
      </section>

      <section className="policy-section">
        <h2>When to use another method</h2>
        <p>
          Use cloud storage or a managed transfer service when a file is larger than 5 MB, needs to
          remain available, requires recipient-specific permissions, or must be auditable. For a
          quick non-sensitive handoff, see the <Link href="/guides/temporary-sharing-and-privacy">temporary sharing guide</Link>.
        </p>
      </section>
    </ContentPage>
  );
}
