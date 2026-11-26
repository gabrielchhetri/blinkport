import type { Metadata } from "next";
import Link from "next/link";

import { ContentPage } from "@/components/content-page";

export const metadata: Metadata = {
  title: "What Temporary Sharing and 10-Minute Expiry Mean",
  description:
    "Understand Blinkport's 10-minute share lifetime, QR and code access, what expires on the service, and what expiry cannot remove.",
  alternates: { canonical: "/guides/temporary-sharing-and-privacy" },
};

export default function TemporarySharingGuidePage() {
  return (
    <ContentPage
      actions={<Link className="primary-link" href="/privacy">Read the privacy policy</Link>}
      intro="Temporary storage is useful for a quick handoff, but it is important to understand exactly what the timer does and does not promise."
      title="Understand the 10-minute sharing window."
    >
      <section className="policy-section">
        <h2>When the timer starts</h2>
        <p>
          Blinkport starts the 10-minute lifetime when a share is successfully created. The page
          shows a countdown so both people can see that the handoff is temporary. The timer is not
          extended by opening the link, scanning the QR code, or entering the access code.
        </p>
      </section>

      <section className="policy-section">
        <h2>What expires</h2>
        <p>
          The service stops returning the paste record and any uploaded file after the share expires.
          There is no account-based library or history page for finding old shares. If you need to
          send the same content again later, return to the original source and create a new share.
        </p>
        <p>
          During the active window, the six-digit code and direct QR route are ways to reach the
          same share. Treat both as access methods: only pass them to the person who should receive
          the content.
        </p>
      </section>

      <section className="policy-section">
        <h2>What expiry cannot do</h2>
        <ul className="content-list">
          <li>It cannot erase a file that the recipient downloaded before the timer ended.</li>
          <li>It cannot remove screenshots, copied text, or copies saved by another application.</li>
          <li>It does not control independent operational logs kept by hosting or network providers.</li>
          <li>It is not a substitute for a secret manager, private drive, or access-controlled workspace.</li>
        </ul>
      </section>

      <section className="policy-section">
        <h2>Choose content accordingly</h2>
        <p>
          Share only the minimum information needed for the handoff. Do not use a public-link tool
          for passwords, API keys, regulated records, or information that must remain restricted.
          For code, remove credentials and customer data before pasting. For files, check the
          contents and filename before uploading.
        </p>
        <p>
          See <Link href="/guides/share-code-between-devices">the code-sharing workflow</Link>,
          <Link href="/guides/send-a-file-to-another-device"> the file-transfer guide</Link>, or the
          full <Link href="/privacy">privacy policy</Link>.
        </p>
      </section>
    </ContentPage>
  );
}
