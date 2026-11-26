"use client";

import Link from "next/link";
import type { ComponentProps, MouseEvent } from "react";

type SamePageReloadLinkProps = Omit<ComponentProps<typeof Link>, "href"> & { href: string };

export function SamePageReloadLink({ href, onClick, ...props }: SamePageReloadLinkProps) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);

    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      (event.currentTarget.target && event.currentTarget.target !== "_self") ||
      event.currentTarget.hasAttribute("download")
    ) {
      return;
    }

    const destination = new URL(href, window.location.href);

    if (
      destination.origin === window.location.origin &&
      destination.pathname === window.location.pathname
    ) {
      event.preventDefault();

      if (destination.href === window.location.href) {
        window.location.reload();
      } else {
        window.location.assign(destination.href);
      }
    }
  }

  return <Link {...props} href={href as ComponentProps<typeof Link>["href"]} onClick={handleClick} />;
}
