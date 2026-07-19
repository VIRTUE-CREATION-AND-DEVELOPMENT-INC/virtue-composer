import type { ReactNode } from "react";

export type InlineMessageProps = { children: ReactNode; title?: ReactNode; tone?: "neutral" | "info" | "success" | "warning" | "danger"; icon?: ReactNode; live?: "off" | "polite" | "assertive"; className?: string };

export default function InlineMessage({ children, title, tone = "neutral", icon, live = tone === "danger" ? "assertive" : "polite", className }: InlineMessageProps) {
  return <div role={tone === "danger" ? "alert" : "status"} aria-live={live} className={className} data-vc-component="inline-message" data-vc-tone={tone}>{icon && <span aria-hidden="true" data-vc-inline-icon>{icon}</span>}<span>{title && <strong>{title}</strong>}{children}</span></div>;
}
