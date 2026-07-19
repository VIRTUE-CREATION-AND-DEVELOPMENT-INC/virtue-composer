"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import Link from "next/link";
import type { ReactElement, ReactNode } from "react";

export type MenuItem = { id: string; label: ReactNode; icon?: ReactNode; disabled?: boolean; destructive?: boolean; href?: string } | { id: string; separator: true };
export type MenuProps = { trigger: ReactElement; items: MenuItem[]; onAction?: (id: string) => void; ariaLabel?: string; align?: "start" | "center" | "end"; side?: "top" | "right" | "bottom" | "left"; className?: string };

export default function Menu({ trigger, items, onAction, ariaLabel = "Actions", align = "end", side = "bottom", className }: MenuProps) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild aria-label={ariaLabel}>{trigger}</DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content align={align} side={side} sideOffset={6} className={className} data-vc-component="menu">
          {items.map((item) => {
            if ("separator" in item) return <DropdownMenu.Separator key={item.id} data-vc-menu-separator />;
            const content = <>{item.icon && <span aria-hidden="true" data-vc-menu-icon>{item.icon}</span>}<span>{item.label}</span></>;
            if (item.href) {
              return <DropdownMenu.Item key={item.id} disabled={item.disabled} asChild data-vc-menu-item data-vc-destructive={item.destructive || undefined}><Link href={item.href}>{content}</Link></DropdownMenu.Item>;
            }
            return <DropdownMenu.Item key={item.id} disabled={item.disabled} data-vc-menu-item data-vc-destructive={item.destructive || undefined} onSelect={() => onAction?.(item.id)}>{content}</DropdownMenu.Item>;
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
