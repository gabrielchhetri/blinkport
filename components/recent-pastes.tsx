import Link from "next/link";

import { formatBytes, formatRemainingTime } from "@/lib/paste-store";
import type { PasteRecord } from "@/lib/types";

interface RecentPastesProps {
  pastes: PasteRecord[];
}

export function RecentPastes({ pastes }: RecentPastesProps) {
  return (
    <section className="panel recent-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Active 10-minute shares</p>
          <h2>Shares that still exist right now.</h2>
        </div>
        <div className="count-pill">{String(pastes.length).padStart(2, "0")} local</div>
      </div>

      <p className="subtle panel-intro">Expired shares are removed automatically, along with their uploaded files.</p>

      {pastes.length === 0 ? (
        <div className="empty-state">
          <p>No pastes yet. Create the first one to populate the board.</p>
        </div>
      ) : (
        <div className="recent-list">
          {pastes.map((paste) => (
            <Link key={paste.id} className="recent-card" href={`/p/${paste.id}`}>
              <div className="recent-head">
                <span className="tag">{paste.mode}</span>
                <span className="subtle">{formatRemainingTime(paste.expiresAt)}</span>
              </div>
              <h3>{paste.title}</h3>
              <p className="recent-preview">
                {paste.content
                  ? `${paste.content.slice(0, 110)}${paste.content.length > 110 ? "..." : ""}`
                  : "Attachment-only paste"}
              </p>
              <div className="recent-card-footer">
                {paste.attachment ? (
                  <small>
                    {paste.attachment.originalName} • {formatBytes(paste.attachment.size)}
                  </small>
                ) : (
                  <small>{paste.content.length.toLocaleString()} characters</small>
                )}
                <span className="recent-id">Code {paste.accessCode}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
