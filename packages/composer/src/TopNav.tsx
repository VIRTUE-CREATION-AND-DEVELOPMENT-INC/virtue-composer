import Link from "next/link";
import type { ReactNode } from "react";

export type TopNavItem = { id: string; label: ReactNode; href: string; current?: boolean; disabled?: boolean };
export type TopNavProps = { items: TopNavItem[]; ariaLabel?: string; actions?: ReactNode; className?: string };

export default function TopNav({ items, ariaLabel = "Primary", actions, className }: TopNavProps) {
  return (
    <nav aria-label={ariaLabel} className={className} data-vc-component="top-nav" data-vc-slot="root">
      <ul data-vc-top-nav-list>{items.map((item) => <li key={item.id}>
        {item.disabled ? <span aria-disabled="true" data-vc-top-nav-link>{item.label}</span> : <Link href={item.href} aria-current={item.current ? "page" : undefined} data-vc-top-nav-link>{item.label}</Link>}
      </li>)}</ul>
      {actions && <div data-vc-top-nav-actions>{actions}</div>}
    </nav>
  );
}
