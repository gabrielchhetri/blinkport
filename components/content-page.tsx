import type { ReactNode } from "react";

interface ContentPageProps {
  actions?: ReactNode;
  children: ReactNode;
  intro: string;
  title: string;
}

export function ContentPage({ actions, children, intro, title }: ContentPageProps) {
  return (
    <main className="shell content-page" id="main-content">
      <section className="content-hero">
        <div className="content-hero-copy">
          <h1>{title}</h1>
          <p className="lead">{intro}</p>
        </div>
        {actions ? <div className="content-actions">{actions}</div> : null}
      </section>

      <div className="content-stack">{children}</div>
    </main>
  );
}
