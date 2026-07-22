"use client";

import * as ContextMenuPrimitive from "@radix-ui/react-context-menu";
import Link from "next/link";
import type { ReactNode } from "react";

export type ContextMenuItem = { id: string; label: ReactNode; icon?: ReactNode; disabled?: boolean; destructive?: boolean; href?: string } | { id: string; separator: true };
export type ContextMenuProps = { children: ReactNode; items: ContextMenuItem[]; onAction?: (id: string) => void; ariaLabel?: string; className?: string };

export default function ContextMenu({ children, items, onAction, ariaLabel = "Context actions", className }: ContextMenuProps) {
  return <ContextMenuPrimitive.Root><ContextMenuPrimitive.Trigger asChild><div data-vc-context-trigger>{children}</div></ContextMenuPrimitive.Trigger><ContextMenuPrimitive.Portal><ContextMenuPrimitive.Content aria-label={ariaLabel} className={className} data-vc-component="context-menu" data-vc-slot="root">{items.map((item) => {
    if ("separator" in item) return <ContextMenuPrimitive.Separator key={item.id} data-vc-context-separator />;
    const content = <>{item.icon && <span aria-hidden="true">{item.icon}</span>}<span>{item.label}</span></>;
    if (item.href) return <ContextMenuPrimitive.Item key={item.id} asChild disabled={item.disabled} data-vc-context-item data-vc-destructive={item.destructive || undefined}><Link href={item.href}>{content}</Link></ContextMenuPrimitive.Item>;
    return <ContextMenuPrimitive.Item key={item.id} disabled={item.disabled} onSelect={() => onAction?.(item.id)} data-vc-context-item data-vc-destructive={item.destructive || undefined}>{content}</ContextMenuPrimitive.Item>;
  })}</ContextMenuPrimitive.Content></ContextMenuPrimitive.Portal></ContextMenuPrimitive.Root>;
}
