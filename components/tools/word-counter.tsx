"use client";

import { useState } from "react";

export function WordCounter() {
  const [text, setText] = useState("");
  const characters = Array.from(text).length;
  const charactersNoSpaces = Array.from(text).filter((character) => !/\s/u.test(character)).length;
  const words = text.trim() ? text.trim().split(/\s+/u).length : 0;
  const lines = text ? text.split(/\r\n|\r|\n/).length : 0;

  return (
    <div className="utility-editor-stack">
      <label className="field utility-field">
        <span>Text to count</span>
        <textarea
          onChange={(event) => setText(event.target.value)}
          placeholder="Paste or type your text here..."
          value={text}
        />
      </label>

      <dl aria-live="polite" className="counter-results">
        <div><dt>Words</dt><dd>{words.toLocaleString()}</dd></div>
        <div><dt>Characters</dt><dd>{characters.toLocaleString()}</dd></div>
        <div><dt>Without spaces</dt><dd>{charactersNoSpaces.toLocaleString()}</dd></div>
        <div><dt>Lines</dt><dd>{lines.toLocaleString()}</dd></div>
      </dl>

      <button className="text-button counter-clear" onClick={() => setText("")} type="button">
        Clear text
      </button>
    </div>
  );
}
