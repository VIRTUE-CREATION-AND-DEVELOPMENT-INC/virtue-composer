import Link from "next/link";
import type { ReactNode } from "react";

export type ListViewItem = { id: string; title: ReactNode; description?: ReactNode; metadata?: ReactNode; href?: string; leading?: ReactNode; trailing?: ReactNode };
export type ListViewProps = { items: ListViewItem[]; ariaLabel?: string; empty?: ReactNode; className?: string };

export default function ListView({ items, ariaLabel = "Items", empty, className }: ListViewProps) {
  if (items.length === 0) return <div className={className} data-vc-component="list-view" data-vc-slot="root" data-vc-empty>{empty}</div>;
  return (
    <ul aria-label={ariaLabel} className={className} data-vc-component="list-view" data-vc-slot="root">
      {items.map((item) => <li key={item.id} data-vc-list-item>
        {item.leading && <div aria-hidden="true" data-vc-list-leading>{item.leading}</div>}
        <div data-vc-list-copy>{item.href ? <Link href={item.href}>{item.title}</Link> : <div data-vc-list-title>{item.title}</div>}{item.description && <div data-vc-list-description>{item.description}</div>}{item.metadata && <div data-vc-list-metadata>{item.metadata}</div>}</div>
        {item.trailing && <div data-vc-list-trailing>{item.trailing}</div>}
      </li>)}
    </ul>
  );
}
