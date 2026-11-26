import type { ReactNode } from "react";
import Link from "next/link";

import { utilityTools } from "@/lib/site";

interface UtilityToolPageProps {
  children: ReactNode;
  guide: ReactNode;
  guideTitle: string;
  intro: string;
  path: string;
  title: string;
}

export function UtilityToolPage({ children, guide, guideTitle, intro, path, title }: UtilityToolPageProps) {
  return (
    <main className="shell utility-page" id="main-content">
      <nav aria-label="Breadcrumb" className="utility-breadcrumb">
        <Link href="/tools">All tools</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{title}</span>
      </nav>

      <header className="utility-hero">
        <h1>{title}</h1>
        <p className="lead">{intro}</p>
      </header>

      <section aria-label={`${title} tool`} className="utility-workbench">
        {children}
        <p className="utility-privacy-note">
          Runs in your browser. Your text is not sent to Blinkport or saved as a share.
        </p>
      </section>

      <article className="utility-guide">
        <h2>{guideTitle}</h2>
        {guide}
      </article>

      <nav aria-label="More browser tools" className="utility-related">
        <h2>More browser tools</h2>
        <ul>
          {utilityTools
            .filter((tool) => tool.href !== path)
            .map((tool) => (
              <li key={tool.href}>
                <Link href={tool.href}>{tool.name}</Link>
              </li>
            ))}
        </ul>
      </nav>
    </main>
  );
}
