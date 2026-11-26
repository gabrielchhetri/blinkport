"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AccessCodePanel() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedCode = code.replace(/\D/g, "").slice(0, 6);
    setCode(normalizedCode);
    setError("");

    if (normalizedCode.length !== 6) {
      setError("Enter the full 6-digit access code.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/access-code/${normalizedCode}`);
      const payload = (await response.json()) as { error?: string; id?: string };

      if (!response.ok || !payload.id) {
        setError(payload.error ?? "That code is invalid or has expired.");
        return;
      }

      router.push(`/p/${payload.id}`);
      router.refresh();
    } catch {
      setError("The code lookup did not complete. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="panel access-panel">
      <div className="panel-header">
        <div>
          <h2>Have a 6-digit code?</h2>
        </div>
        <div className="count-pill">10-minute window</div>
      </div>

      <p className="subtle panel-intro">
        Enter the code from the sender&apos;s share page. Expired shares cannot be reopened.
      </p>

      <form className="access-form" onSubmit={handleSubmit}>
        <label className="field">
          <span>6-digit access code</span>
          <input
            className="access-code-input"
            inputMode="numeric"
            maxLength={6}
            autoComplete="one-time-code"
            onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
            pattern="[0-9]{6}"
            placeholder="123456"
            type="text"
            value={code}
          />
        </label>

        {error ? <p className="inline-error" role="alert">{error}</p> : null}

        <div className="actions-row">
          <button className="primary-link button-reset" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Checking code..." : "Open share"}
          </button>
          <p className="subtle helper-copy">You can also skip typing and scan the sender&apos;s QR code.</p>
        </div>
      </form>
    </section>
  );
}
