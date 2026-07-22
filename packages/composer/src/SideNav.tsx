import Link from "next/link";
import type { ReactNode } from "react";

export type SideNavItem = { id: string; label: ReactNode; href: string; icon?: ReactNode; current?: boolean; disabled?: boolean; badge?: ReactNode };
export type SideNavGroup = { id: string; label?: ReactNode; items: SideNavItem[] };
export type SideNavProps = { groups: SideNavGroup[]; ariaLabel?: string; className?: string };

export default function SideNav({ groups, ariaLabel = "Primary", className }: SideNavProps) {
  return (
    <nav aria-label={ariaLabel} className={className} data-vc-component="side-nav" data-vc-slot="root">
      {groups.map((group) => (
        <div key={group.id} data-vc-side-nav-group>
          {group.label && <div data-vc-side-nav-label>{group.label}</div>}
          <ul data-vc-side-nav-list>
            {group.items.map((item) => <li key={item.id} data-vc-side-nav-item>
              {item.disabled
                ? <span aria-disabled="true" data-vc-side-nav-link>{item.icon && <span aria-hidden="true">{item.icon}</span>}<span>{item.label}</span>{item.badge}</span>
                : <Link href={item.href} aria-current={item.current ? "page" : undefined} data-vc-side-nav-link>{item.icon && <span aria-hidden="true">{item.icon}</span>}<span>{item.label}</span>{item.badge}</Link>}
            </li>)}
          </ul>
        </div>
      ))}
    </nav>
  );
}
