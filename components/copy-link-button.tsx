"use client";

import { useState } from "react";

export function CopyLinkButton() {
  const [label, setLabel] = useState("Copy link");

  async function handleClick() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setLabel("Copied");

      window.setTimeout(() => {
        setLabel("Copy link");
      }, 1500);
    } catch {
      setLabel("Clipboard blocked");
    }
  }

  return (
    <button className="primary-link button-reset" onClick={handleClick} type="button">
      {label}
    </button>
  );
}
