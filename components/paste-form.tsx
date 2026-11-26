"use client";

import { useState } from "react";

import { LanguageSelect } from "@/components/language-select";
import { ShareCountdown } from "@/components/share-countdown";

const LANGUAGE_OPTIONS = [
  { label: "TypeScript", value: "typescript" },
  { label: "JavaScript", value: "javascript" },
  { label: "TSX", value: "tsx" },
  { label: "JSX", value: "jsx" },
  { label: "JSON", value: "json" },
  { label: "HTML", value: "html" },
  { label: "CSS", value: "css" },
  { label: "Bash", value: "bash" },
  { label: "Python", value: "python" },
  { label: "SQL", value: "sql" },
  { label: "Markdown", value: "markdown" },
  { label: "YAML", value: "yaml" },
];

type PasteMode = "text" | "code" | "file";

export function PasteForm() {
  const [mode, setMode] = useState<PasteMode>("code");
  const [language, setLanguage] = useState("typescript");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shareResult, setShareResult] = useState<null | {
    accessCode: string;
    expiresAt: string;
    id: string;
  }>(null);

  const charCount = content.length.toLocaleString();

  function handleModeChange(nextMode: PasteMode) {
    setMode(nextMode);
    if (nextMode !== "file") setFile(null);
    setIsDragging(false);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setShareResult(null);

    if (mode === "file" && !file) {
      setError("Choose a file to create a file share.");
      return;
    }

    if (file && file.size > 5 * 1024 * 1024) {
      setError("The file is too large. Keep it under 5 MB.");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.set("mode", mode);
      formData.set("title", title);
      formData.set("language", language);
      formData.set("content", content);

      if (mode === "file" && file) {
        formData.set("file", file);
      }

      const response = await fetch("/api/pastes", {
        body: formData,
        method: "POST",
      });

      const payload = (await response.json()) as {
        accessCode?: string;
        error?: string;
        expiresAt?: string;
        id?: string;
      };

      if (!response.ok || !payload.id || !payload.accessCode || !payload.expiresAt) {
        setError(payload.error ?? "Something went wrong while creating the share.");
        return;
      }

      setShareResult({
        accessCode: payload.accessCode,
        expiresAt: payload.expiresAt,
        id: payload.id,
      });
    } catch {
      setError("The request did not complete. Check the server and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleFileDrop(event: React.DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(false);
    const droppedFile = event.dataTransfer.files.item(0);

    if (droppedFile) {
      setFile(droppedFile);
      setError("");
    }
  }

  return (
    <section className="panel panel-strong panel-composer">
      <div className="panel-header">
        <div>
          <h2>Make a share</h2>
          <p className="panel-intro">Choose a format, then send it on.</p>
        </div>
        <p className="share-limits">10 min <span aria-hidden="true">/</span> 5 MB max</p>
      </div>

      <form className="paste-form" onSubmit={handleSubmit}>
        <fieldset className="mode-switch">
          <legend className="sr-only">What would you like to share?</legend>
          {[
            { label: "Text", value: "text" },
            { label: "Code", value: "code" },
            { label: "File", value: "file" },
          ].map((option) => (
            <label key={option.value} className={mode === option.value ? "mode-pill active" : "mode-pill"}>
              <input
                checked={mode === option.value}
                name="mode"
                onChange={() => handleModeChange(option.value as PasteMode)}
                type="radio"
                value={option.value}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </fieldset>

        <div className={mode === "code" ? "field-grid" : undefined}>
          <label className="field">
            <span>Title (optional)</span>
            <input
              maxLength={80}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Build notes"
              type="text"
              value={title}
            />
          </label>

          {mode === "code" ? (
            <label className="field">
              <span>Language</span>
              <LanguageSelect options={LANGUAGE_OPTIONS} value={language} onChange={setLanguage} />
            </label>
          ) : null}
        </div>

        {mode !== "file" ? (
          <label className="field">
            <span>{mode === "code" ? "Code snippet" : "Text to share"}</span>
            <textarea
              onChange={(event) => setContent(event.target.value)}
              placeholder={mode === "code" ? "Paste your snippet here..." : "Paste a note, link, or draft here..."}
              rows={11}
              spellCheck={mode !== "code"}
              value={content}
            />
            <small>{charCount} characters</small>
          </label>
        ) : (
          <label
            className={isDragging ? "field field-file is-dragging" : "field field-file"}
            onDragEnter={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                setIsDragging(false);
              }
            }}
            onDrop={handleFileDrop}
          >
            <span className="sr-only">Choose a file up to 5 MB</span>
            <div className="dropzone-ui">
              <svg aria-hidden="true" className="upload-icon" fill="none" height="28" viewBox="0 0 24 24" width="28">
                <path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M5 14v5h14v-5" />
              </svg>
              <strong>{file ? file.name : "Drop a file here or browse"}</strong>
              <small>{file ? (file.size / 1024).toFixed(1) + " KB - ready to share" : "Any file type, up to 5 MB."}</small>
            </div>
            <input
              accept="*/*"
              className="file-input-hidden"
              onChange={(event) => {
                setFile(event.target.files?.[0] ?? null);
                setIsDragging(false);
                setError("");
              }}
              type="file"
            />
          </label>
        )}

        {error ? <p className="error-banner" role="alert">{error}</p> : null}

        <div className="actions-row">
          <button className="primary-link button-reset" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Creating share..." : "Create share link"}
          </button>
          <p className="subtle helper-copy">A 6-digit code and QR are ready with your share.</p>
        </div>

        {shareResult ? (
          <div className="share-created-banner">
            <div className="share-result-copy">
              <p className="share-ready-label" role="status">Share ready</p>
              <h3>{shareResult.accessCode}</h3>
              <p>Enter this code on another device, or open the share page for its QR code.</p>
            </div>
            <ShareCountdown compact expiresAt={shareResult.expiresAt} />
            <a className="secondary-link" href={"/p/" + shareResult.id}>Open share and QR</a>
          </div>
        ) : null}
      </form>
    </section>
  );
}
