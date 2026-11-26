"use client";

import { useEffect, useMemo, useState } from "react";

interface ShareCountdownProps {
  compact?: boolean;
  expiresAt: string;
}

function formatCountdown(remainingMs: number) {
  if (remainingMs <= 0) {
    return "Expired";
  }

  const totalSeconds = Math.floor(remainingMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0");
}

export function ShareCountdown({ compact = false, expiresAt }: ShareCountdownProps) {
  const expiryTime = useMemo(() => new Date(expiresAt).getTime(), [expiresAt]);
  const [remainingMs, setRemainingMs] = useState(() => Math.max(expiryTime - Date.now(), 0));

  useEffect(() => {
    const timer = window.setInterval(() => {
      setRemainingMs(Math.max(expiryTime - Date.now(), 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [expiryTime]);

  const expired = remainingMs <= 0;
  const timerRadius = 40;
  const timerCircumference = 2 * Math.PI * timerRadius;
  const maxTimeMs = 10 * 60 * 1000;
  const progressPercent = Math.min(Math.max(remainingMs / maxTimeMs, 0), 1);
  const strokeDashoffset = timerCircumference - progressPercent * timerCircumference;

  if (compact) {
    return (
      <div className="countdown-inline" role="timer">
        <span aria-hidden="true" className={expired ? "countdown-inline-dot expired" : "countdown-inline-dot"} />
        <time dateTime={expiresAt}>{formatCountdown(remainingMs)}</time>
        <span>{expired ? "expired" : "remaining"}</span>
      </div>
    );
  }

  return (
    <div className={expired ? "countdown-card expired" : "countdown-card"}>
      <div className="countdown-ring">
        <svg aria-hidden="true" viewBox="0 0 100 100" width="100" height="100">
          <circle cx="50" cy="50" r={timerRadius} fill="none" stroke="var(--line)" strokeWidth="5" />
          <circle
            className="countdown-svg-ring"
            cx="50"
            cy="50"
            r={timerRadius}
            fill="none"
            stroke={expired ? "var(--danger)" : "var(--accent)"}
            strokeWidth="5"
            strokeDasharray={timerCircumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        <div className="countdown-text">
          <span className="countdown-label">{expired ? "Share expired" : "Time remaining"}</span>
          <strong>{formatCountdown(remainingMs)}</strong>
        </div>
      </div>
      <p>{expired ? "Create a new share to send the content again." : "The share is removed when the timer reaches zero."}</p>
    </div>
  );
}
