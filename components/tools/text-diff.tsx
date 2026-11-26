"use client";

import { useState } from "react";

interface DiffLine {
  kind: "added" | "removed" | "same";
  text: string;
}

function compareLines(before: string[], after: string[]): DiffLine[] {
  const rows = Array.from({ length: before.length + 1 }, () => new Uint16Array(after.length + 1));

  for (let i = before.length - 1; i >= 0; i -= 1) {
    for (let j = after.length - 1; j >= 0; j -= 1) {
      rows[i][j] = before[i] === after[j]
        ? rows[i + 1][j + 1] + 1
        : Math.max(rows[i + 1][j], rows[i][j + 1]);
    }
  }

  const result: DiffLine[] = [];
  let i = 0;
  let j = 0;

  while (i < before.length && j < after.length) {
    if (before[i] === after[j]) {
      result.push({ kind: "same", text: before[i] });
      i += 1;
      j += 1;
    } else if (rows[i + 1][j] >= rows[i][j + 1]) {
      result.push({ kind: "removed", text: before[i] });
      i += 1;
    } else {
      result.push({ kind: "added", text: after[j] });
      j += 1;
    }
  }

  while (i < before.length) {
    result.push({ kind: "removed", text: before[i] });
    i += 1;
  }

  while (j < after.length) {
    result.push({ kind: "added", text: after[j] });
    j += 1;
  }

  return result;
}

export function TextDiff() {
  const [before, setBefore] = useState("");
  const [after, setAfter] = useState("");
  const [result, setResult] = useState<DiffLine[] | null>(null);
  const [error, setError] = useState("");

  function runComparison() {
    setError("");
    const oldLines = before ? before.split(/\r\n|\r|\n/) : [];
    const newLines = after ? after.split(/\r\n|\r|\n/) : [];

    if (!before && !after) {
      setResult(null);
      setError("Add text to both boxes before comparing.");
      return;
    }

    if (oldLines.length > 500 || newLines.length > 500) {
      setResult(null);
      setError("For a quick comparison, each version can contain up to 500 lines.");
      return;
    }

    setResult(compareLines(oldLines, newLines));
  }

  const addedCount = result?.filter((line) => line.kind === "added").length ?? 0;
  const removedCount = result?.filter((line) => line.kind === "removed").length ?? 0;

  return (
    <div className="utility-editor-stack">
      <div className="utility-input-grid">
        <label className="field utility-field">
          <span>Original text</span>
          <textarea
            onChange={(event) => setBefore(event.target.value)}
            placeholder="Paste the earlier version..."
            spellCheck={false}
            value={before}
          />
        </label>
        <label className="field utility-field">
          <span>Updated text</span>
          <textarea
            onChange={(event) => setAfter(event.target.value)}
            placeholder="Paste the newer version..."
            spellCheck={false}
            value={after}
          />
        </label>
      </div>

      <div className="utility-toolbar">
        <div className="utility-actions">
          <button className="primary-link button-reset" onClick={runComparison} type="button">
            Compare versions
          </button>
          <button
            className="text-button"
            onClick={() => {
              setBefore("");
              setAfter("");
              setResult(null);
              setError("");
            }}
            type="button"
          >
            Clear
          </button>
        </div>
        <p className="utility-limit">Up to 500 lines per version</p>
      </div>

      {error ? <p className="error-banner utility-message" role="alert">{error}</p> : null}
      {result ? (
        <section aria-label="Text comparison result" className="diff-output">
          <p className="diff-summary" role="status">
            {addedCount} added, {removedCount} removed
          </p>
          <ol className="diff-lines">
            {result.map((line, index) => (
              <li className={`diff-line diff-${line.kind}`} key={`${index}-${line.kind}`}>
                <span aria-hidden="true" className="diff-marker">
                  {line.kind === "added" ? "+" : line.kind === "removed" ? "-" : " "}
                </span>
                <code>{line.text || " "}</code>
              </li>
            ))}
          </ol>
        </section>
      ) : null}
    </div>
  );
}
