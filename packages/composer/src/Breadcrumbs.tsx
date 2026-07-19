import Link from "next/link";
import type { ReactNode } from "react";

export type BreadcrumbItem = { id: string; label: ReactNode; href?: string; current?: boolean };
export type BreadcrumbsProps = { items: BreadcrumbItem[]; separator?: ReactNode; ariaLabel?: string; className?: string };

export default function Breadcrumbs({ items, separator = "/", ariaLabel = "Breadcrumb", className }: BreadcrumbsProps) {
  return (
    <nav aria-label={ariaLabel} className={className} data-vc-component="breadcrumbs">
      <ol data-vc-breadcrumb-list>
        {items.map((item, index) => {
          const current = item.current ?? index === items.length - 1;
          return (
            <li key={item.id} data-vc-breadcrumb-item>
              {item.href && !current ? <Link href={item.href}>{item.label}</Link> : <span aria-current={current ? "page" : undefined}>{item.label}</span>}
              {index < items.length - 1 && <span aria-hidden="true" data-vc-breadcrumb-separator>{separator}</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
