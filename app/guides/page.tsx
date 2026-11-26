import type { Metadata } from "next";
import Link from "next/link";

import { ContentPage } from "@/components/content-page";

export const metadata: Metadata = {
  title: "Practical Guides for Sharing Text, Code, and Files",
  description:
    "Step-by-step guides to moving snippets between devices, sending small files with QR access, and understanding Blinkport's 10-minute expiry.",
  alternates: { canonical: "/guides" },
};

const guides = [
  {
    href: "/guides/share-code-between-devices",
    title: "Move a code snippet between devices",
    summary: "A careful workflow for sending a small code sample from a desktop to a phone or another computer.",
  },
  {
    href: "/guides/send-a-file-to-another-device",
    title: "Send a small file to another device",
    summary: "Use the file share mode, QR access, and an attachment download for files up to 5 MB.",
  },
  {
    href: "/guides/temporary-sharing-and-privacy",
    title: "Understand temporary sharing and expiry",
    summary: "Learn what the 10-minute window means, what expires, and what it cannot remove from a recipient's device.",
  },
] as const;

export default function GuidesPage() {
  return (
    <ContentPage
      intro="Short, practical instructions for common cross-device handoffs. Each guide explains the steps, the limits, and when a temporary share is the wrong tool."
      title="Guides for useful, careful sharing."
    >
      <section className="content-grid" aria-label="Blinkport guides">
        {guides.map((guide) => (
          <article className="content-card" key={guide.href}>
            <h2><Link href={guide.href}>{guide.title}</Link></h2>
            <p>{guide.summary}</p>
            <Link href={guide.href}>Read the guide</Link>
          </article>
        ))}
      </section>
      <section className="policy-section">
        <h2>Choose the right tool</h2>
        <p>
          Blinkport is for brief transfers, not long-term storage or collaboration. For a task that
          needs editing history, access controls, or durable backups, use a service designed for
          those needs instead.
        </p>
        <p><Link href="/tools">Explore the browser tools</Link> or <Link href="/#composer">create a temporary share</Link>.</p>
      </section>
    </ContentPage>
  );
}
