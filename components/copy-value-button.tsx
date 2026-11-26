"use client";

import { useToast } from "@/components/toast-provider";

interface CopyValueButtonProps {
  defaultLabel?: string;
  value: string;
}

export function CopyValueButton({
  defaultLabel = "Copy",
  value,
}: CopyValueButtonProps) {
  const { toast } = useToast();

  async function handleClick() {
    try {
      await navigator.clipboard.writeText(value);
      toast("Copied to clipboard");
    } catch {
      toast("Clipboard blocked");
    }
  }

  return (
    <button className="primary-link button-reset" onClick={handleClick} type="button">
      {defaultLabel}
    </button>
  );
}
