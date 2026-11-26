"use client";

import { useState } from "react";

import { CopyValueButton } from "@/components/copy-value-button";

export function JsonFormatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [indent, setIndent] = useState("2");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  function transform(compact: boolean) {
    setError("");
    setStatus("");

    if (!input.trim()) {
      setOutput("");
      setError("Paste JSON into the input box first.");
      return;
    }

    try {
      const parsed: unknown = JSON.parse(input);
      const nextOutput = JSON.stringify(parsed, null, compact ? 0 : Number(indent));
      setOutput(nextOutput);
      setStatus(compact ? "Valid JSON. Minified output is ready." : "Valid JSON. Formatted output is ready.");
    } catch (cause) {
      setOutput("");
      setError(cause instanceof Error ? cause.message : "This is not valid JSON.");
    }
  }

  return (
    <div className="utility-editor-stack">
      <div className="utility-input-grid">
        <label className="field utility-field">
          <span>JSON input</span>
          <textarea
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            onChange={(event) => {
              setInput(event.target.value);
              setOutput("");
              setError("");
              setStatus("");
            }}
            placeholder={'Paste JSON here, for example:\n{ "name": "Blinkport", "active": true }'}
            spellCheck={false}
            value={input}
          />
        </label>

        <label className="field utility-field">
          <span>Formatted output</span>
          <textarea aria-label="Formatted JSON output" readOnly value={output} />
        </label>
      </div>

      <div className="utility-toolbar">
        <div className="utility-actions">
          <button className="primary-link button-reset" onClick={() => transform(false)} type="button">
            Format JSON
          </button>
          <button className="secondary-link button-reset" onClick={() => transform(true)} type="button">
            Minify
          </button>
          {output ? <CopyValueButton defaultLabel="Copy output" value={output} /> : null}
          <button
            className="text-button"
            onClick={() => {
              setInput("");
              setOutput("");
              setError("");
              setStatus("");
            }}
            type="button"
          >
            Clear
          </button>
        </div>

        <label className="utility-indent">
          <span>Indent</span>
          <select onChange={(event) => setIndent(event.target.value)} value={indent}>
            <option value="2">2 spaces</option>
            <option value="4">4 spaces</option>
          </select>
        </label>
      </div>

      {error ? <p className="error-banner utility-message" role="alert">{error}</p> : null}
      {status ? <p className="utility-status" role="status">{status}</p> : null}
    </div>
  );
}
