"use client";

import { useState, type ReactNode } from "react";

export type BannerProps = { title?: ReactNode; children: ReactNode; tone?: "neutral" | "info" | "success" | "warning" | "danger"; icon?: ReactNode; actions?: ReactNode; dismissLabel?: string; dismissible?: boolean; onDismiss?: () => void; className?: string };

export default function Banner({ title, children, tone = "neutral", icon, actions, dismissLabel = "Dismiss", dismissible = false, onDismiss, className }: BannerProps) {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  const dismiss = () => { setVisible(false); onDismiss?.(); };
  return <div role={tone === "danger" ? "alert" : "status"} className={className} data-vc-component="banner" data-vc-slot="root" data-vc-tone={tone}>{icon && <div aria-hidden="true" data-vc-banner-icon>{icon}</div>}<div data-vc-banner-copy>{title && <div data-vc-banner-title>{title}</div>}<div>{children}</div></div>{actions && <div data-vc-banner-actions>{actions}</div>}{dismissible && <button type="button" aria-label={dismissLabel} onClick={dismiss} data-vc-banner-dismiss>{dismissLabel}</button>}</div>;
}
