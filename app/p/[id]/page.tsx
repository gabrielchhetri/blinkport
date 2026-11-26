import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import QRCode from "qrcode";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { CopyValueButton } from "@/components/copy-value-button";
import { ShareCountdown } from "@/components/share-countdown";
import { formatBytes, getPasteById, SHARE_TTL_MINUTES } from "@/lib/paste-store";
import { siteName, siteUrl } from "@/lib/site";

interface PastePageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: PastePageProps): Promise<Metadata> {
  const { id } = await params;
  const paste = await getPasteById(id);

  if (!paste) {
    return {
      title: `Paste Not Found | ${siteName}`,
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return {
    title: `${paste.title} Share`,
    description: "Utility page for a temporary Blinkport share.",
    robots: {
      index: false,
      follow: true,
    },
  };
}

const MAX_NUMBERED_LINES = 2_000;

function renderContent(content: string) {
  const lines = content.split("\n", MAX_NUMBERED_LINES + 1);

  if (lines.length > MAX_NUMBERED_LINES) {
    return (
      <pre className="code-frame code-frame-plain">
        <code>{content}</code>
      </pre>
    );
  }

  return (
    <ol className="code-frame">
      {lines.map((line, index) => (
        <li key={index} className="code-line">
          <span className="line-number">{index + 1}</span>
          <code>{line || " "}</code>
        </li>
      ))}
    </ol>
  );
}

async function getShareBaseUrl() {
  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  const forwardedProto = headerStore.get("x-forwarded-proto");

  if (!host) {
    return siteUrl;
  }

  const protocol = forwardedProto ?? (host.includes("localhost") || host.startsWith("127.0.0.1") ? "http" : "https");
  return `${protocol}://${host}`;
}

export default async function PastePage({ params }: PastePageProps) {
  const { id } = await params;
  const paste = await getPasteById(id);

  if (!paste) {
    notFound();
  }

  const hasContent = Boolean(paste.content);
  const detailLabel =
    paste.mode === "code" ? `${paste.language} code snippet` : paste.mode === "file" ? "temporary file drop" : "temporary text note";
  const createdAt = new Date(paste.createdAt).toLocaleString();
  const expiresAt = new Date(paste.expiresAt).toLocaleString();
  const shareUrl = `${await getShareBaseUrl()}/p/${paste.id}`;
  const qrCodeDataUrl = await QRCode.toDataURL(shareUrl, {
    color: {
      dark: "#13202b",
      light: "#f7ecdf",
    },
    margin: 1,
    width: 280,
  });
  const pasteFacts = [
    { label: "Type", value: paste.mode === "code" ? `Code · ${paste.language}` : paste.mode === "file" ? "File drop" : "Text note" },
    { label: "Created", value: createdAt },
    { label: "Expires", value: expiresAt },
  ];

  return (
    <main className="shell paste-shell" id="main-content">
      <section className="paste-hero">
        <div className="paste-hero-main">
          <h1>{paste.title}</h1>
          <p className="lead">
            This page holds a {detailLabel}. It stays available for {SHARE_TTL_MINUTES} minutes,
            then disappears automatically and has to be created again if you want to send it a
            second time.
          </p>

          <div className="paste-fact-grid">
            {pasteFacts.map((fact) => (
              <article key={fact.label} className="paste-fact-card">
                <span>{fact.label}</span>
                <strong>{fact.value}</strong>
              </article>
            ))}
          </div>
        </div>

        <aside className="paste-hero-side">
          <ShareCountdown expiresAt={paste.expiresAt} />

          <div className="access-method-card">
            <p className="note-kicker">6-digit access code</p>
            <div className="access-code-blocks" aria-label={`Access code ${paste.accessCode}`}>
              {paste.accessCode.split("").map((digit, index) => (
                <span key={`${digit}-${index}`}>{digit}</span>
              ))}
            </div>
            <p className="subtle">
              Enter these six digits on the other device before the share expires.
            </p>
            <CopyValueButton defaultLabel="Copy code" value={paste.accessCode} />
          </div>

          <div className="access-method-card qr-share-card">
            <p className="note-kicker">QR access</p>
            <Image
              alt={`QR code for ${paste.title}`}
              className="qr-image"
              height={220}
              src={qrCodeDataUrl}
              width={220}
            />
            <p className="subtle">
              Scan to open this temporary share directly. QR access works best when this URL is
              reachable from the receiving device.
            </p>
          </div>

          <div className="paste-actions">
            <Link className="secondary-link" href="/">
              Create another
            </Link>
          </div>
        </aside>
      </section>

      {paste.attachment ? (
        <section className="attachment-card">
          <div>
            <h2>{paste.attachment.originalName}</h2>
            <p className="subtle">
              {formatBytes(paste.attachment.size)} • {paste.attachment.mimeType}
            </p>
            <p className="attachment-copy">
              Files are always returned as downloads, and the temporary share is removed after the
              expiry window.
            </p>
          </div>
          <a className="primary-link" href={`/api/files/${paste.id}`}>
            Download file
          </a>
        </section>
      ) : null}

      {hasContent ? (
        <section className="paste-view">
          <div className="paste-meta">
            <span>{paste.mode === "code" ? paste.language : "plain text"}</span>
            <span>{paste.content.length.toLocaleString()} chars</span>
          </div>
          {renderContent(paste.content)}
        </section>
      ) : (
        <section className="empty-state empty-paste">
          <p>This temporary share contains only a file attachment.</p>
        </section>
      )}
    </main>
  );
}
