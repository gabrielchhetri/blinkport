import type { Metadata } from "next";

import { ContentPage } from "@/components/content-page";
import { supportEmail } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Blinkport support for product questions, policy requests, business inquiries, and operational issues.",
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactPage() {
  return (
    <ContentPage
      actions={
        <a className="primary-link" href={`mailto:${supportEmail}`}>
          Email support
        </a>
      }
      intro="Clear contact details are part of a trustworthy public product. Use the addresses below for support, policy, or business questions."
      title="Reach the operator behind the tool."
    >
      <section className="content-grid">
        <article className="content-card">
          <h2>Support</h2>
          <p>
            Email <a href={`mailto:${supportEmail}`}>{supportEmail}</a> for product questions,
            reporting issues, or asking about how public links and uploads behave.
          </p>
        </article>
        <article className="content-card">
          <h2>Policy requests</h2>
          <p>
            If you need clarification around privacy, terms, or acceptable-use rules, use the same
            support channel and include the relevant page or paste URL.
          </p>
        </article>
        <article className="content-card">
          <h2>Business or partnership inquiries</h2>
          <p>
            Advertising, sponsorship, and product-feedback requests can also be directed to the
            support address until a dedicated business contact is published.
          </p>
        </article>
      </section>
    </ContentPage>
  );
}
