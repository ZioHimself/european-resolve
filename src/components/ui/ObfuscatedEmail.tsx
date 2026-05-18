"use client";

import { useCallback } from "react";
import styles from "./ObfuscatedEmail.module.css";

type Props = {
  email: string;
  className?: string;
};

export function ObfuscatedEmail({ email, className }: Props) {
  const [user, domain] = email.split("@");
  const obfuscated = `${user}[at]${domain}`;

  const handleClick = useCallback(
    (e: React.MouseEvent | React.KeyboardEvent) => {
      e.preventDefault();
      const target = e.currentTarget as HTMLElement;
      const u = target.dataset.user;
      const d = target.dataset.domain;
      if (u && d) {
        window.location.href = `mailto:${u}@${d}`;
      }
    },
    []
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        handleClick(e);
      }
    },
    [handleClick]
  );

  return (
    <a
      href="#"
      role="link"
      tabIndex={0}
      data-user={user}
      data-domain={domain}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={className ? `${styles.email} ${className}` : styles.email}
    >
      {obfuscated}
    </a>
  );
}
