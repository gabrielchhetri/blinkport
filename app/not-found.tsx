import Link from "next/link";

export default function NotFound() {
  return (
    <main className="shell paste-shell" id="main-content">
      <section className="paste-header">
        <div>
          <h1>This temporary share is no longer available.</h1>
          <p className="lead">
            It may have expired after the 10-minute window, the code may be wrong, or the link may
            belong to a different running instance of the app.
          </p>
        </div>

        <Link className="primary-link" href="/">
          Return home
        </Link>
      </section>
    </main>
  );
}
