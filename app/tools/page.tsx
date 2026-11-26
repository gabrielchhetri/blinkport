import type { Metadata } from "next";
import Link from "next/link";

import { utilityTools } from "@/lib/site";

export const metadata: Metadata = {
  title: "Free Browser Tools for Text and Code",
  description:
    "Use Blinkport's free JSON formatter, text diff checker, and word counter. These lightweight tools run locally in your browser without saving your input.",
  alternates: { canonical: "/tools" },
};

export default function ToolsPage() {
  return (
    <main className="shell utility-page" id="main-content">
      <header className="utility-hero">
        <h1>Small tools for everyday work.</h1>
        <p className="lead">
          Format data, compare text, or check a word count. Each tool runs in your browser; your
          input is not uploaded or saved as a Blinkport share.
        </p>
      </header>

      <nav aria-label="Blinkport browser tools" className="tool-directory">
        {utilityTools.map((tool) => (
          <Link className="tool-directory-row" href={tool.href} key={tool.href}>
            <span className="tool-directory-copy">
              <strong>{tool.name}</strong>
              <span>{tool.summary}</span>
            </span>
            <span className="tool-directory-arrow">Open tool</span>
          </Link>
        ))}
      </nav>

      <section className="utility-guide">
        <h2>Private by design</h2>
        <p>
          These utilities do not create a share link. Use the home page when you want to send text,
          code, or a small file to another device; shares created there are temporarily available
          for 10 minutes.
        </p>
        <p><Link href="/#composer">Create a temporary share</Link></p>
      </section>
    </main>
  );
}
