import type { ReactNode } from "react";

export type AnchorNavItem = { id: string; label: ReactNode; href: `#${string}`; current?: boolean };
export type AnchorNavProps = { items: AnchorNavItem[]; ariaLabel?: string; className?: string };

export default function AnchorNav({ items, ariaLabel = "On this page", className }: AnchorNavProps) {
  return <nav aria-label={ariaLabel} className={className} data-vc-component="anchor-nav"><ul>{items.map((item) => <li key={item.id}><a href={item.href} aria-current={item.current ? "location" : undefined}>{item.label}</a></li>)}</ul></nav>;
}
