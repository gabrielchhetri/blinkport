import type { Metadata } from "next";

import { AccessCodePanel } from "@/components/access-code-panel";
import { PasteForm } from "@/components/paste-form";
import { siteDescription, siteName, siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Temporary Sharing Tool for Text, Code, and Small Files",
  description:
    "Blinkport creates 10-minute temporary shares for text, code snippets, and small files up to 5 MB with 6-digit access codes and QR access.",
  alternates: {
    canonical: "/",
  },
};

const homeFaqs = [
  {
    answer:
      "Blinkport is a lightweight web tool for sharing text, code snippets, and files up to 5 MB through temporary 10-minute shares.",
    question: "What is Blinkport?",
  },
  {
    answer:
      "You can create plain-text notes, code snippets with readable line layouts, and file drops with optional context.",
    question: "What can I share with Blinkport?",
  },
  {
    answer:
      "Individual uploads are limited to 5 MB so the service stays fast, focused, and useful for lightweight transfer work.",
    question: "How large can uploads be?",
  },
  {
    answer:
      "Shares are stored temporarily for 10 minutes. After that, they are automatically removed, and users need to create a new share if they want to send the same content again.",
    question: "How long are shares kept?",
  },
  {
    answer:
      "Each share generates a 6-digit code, and the sender can also show a QR code so another device can open the share directly.",
    question: "How do other devices access a share?",
  },
];

export default async function HomePage() {
  const homeJsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: `${siteName} home`,
      description: siteDescription,
      url: siteUrl,
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: homeFaqs.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    },
  ];

  return (
    <main className="shell shell-home" id="main-content">
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(homeJsonLd),
        }}
        type="application/ld+json"
      />
      <section aria-labelledby="home-title" className="tool-stage">
        <div className="tool-stage-head">
          <h1 id="home-title">
            Share text, code, and <span>small files.</span>
          </h1>
          <div className="tool-stage-copy">
            <p className="lead">
              Then move on. A quick handoff between your devices. Files can be up to 5 MB; every share expires
              after 10 minutes, with no saved history to return to.
            </p>
            <p className="tool-rules">10-minute expiry <span aria-hidden="true">/</span> 5 MB file limit <span aria-hidden="true">/</span> no saved history</p>
          </div>
        </div>

        <div className="workspace-grid workspace-grid-clean workspace-grid-primary">
          <div className="composer-shell" id="composer">
            <PasteForm />
          </div>

          <div className="surface-stack" id="access-code">
            <AccessCodePanel />
          </div>
        </div>
      </section>

      <section aria-labelledby="how-title" className="section-block how-it-works" id="how-it-works">
        <div className="section-heading">
          <h2 id="how-title">Made for the handoff, not the archive.</h2>
          <p className="lead">
            Blinkport keeps the route between devices short: prepare a share, open it once, and let
            the temporary window close by itself.
          </p>
        </div>

        <ol className="relay-step-list">
          <li>
            <span className="step-index">01</span>
            <div><h3>Choose what to send</h3><p>Paste a note or snippet, or add a file up to 5 MB.</p></div>
          </li>
          <li>
            <span className="step-index">02</span>
            <div><h3>Take the code or QR</h3><p>Use the six-digit code on another device, or scan the QR to open the share.</p></div>
          </li>
          <li>
            <span className="step-index">03</span>
            <div><h3>Let it expire</h3><p>After 10 minutes the share is removed. To send again, create a fresh one.</p></div>
          </li>
        </ol>
      </section>

      <section aria-labelledby="faq-title" className="section-block section-block-compact">
        <div className="section-heading">
          <h2 id="faq-title">A few useful details.</h2>
          <p>Know what is shared, how long it lasts, and what happens when the timer ends.</p>
        </div>

        <div className="faq-list">
          {homeFaqs.map((item) => (
            <details key={item.question} className="faq-item">
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}
