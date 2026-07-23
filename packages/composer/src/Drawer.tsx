"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import type { ReactElement, ReactNode } from "react";
import Button from "./Button";

export type DrawerProps = {
  trigger: ReactElement;
  title: string;
  description?: string;
  children?: ReactNode;
  actions?: ReactNode;
  side?: "left" | "right" | "top" | "bottom";
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  modal?: boolean;
  closeLabel?: string;
  className?: string;
};

export default function Drawer({ trigger, title, description, children, actions, side = "right", open, defaultOpen, onOpenChange, modal = true, closeLabel = "Close drawer", className }: DrawerProps) {
  return (
    <DialogPrimitive.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange} modal={modal}>
      <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay data-vc-drawer-overlay data-vc-slot="overlay" />
        <DialogPrimitive.Content className={className} data-vc-component="drawer" data-vc-slot="root" data-vc-drawer-side={side}>
          <div data-vc-drawer-header data-vc-slot="header">
            <div data-vc-slot="heading">
              <DialogPrimitive.Title data-vc-slot="title">{title}</DialogPrimitive.Title>
              {description && <DialogPrimitive.Description data-vc-slot="description">{description}</DialogPrimitive.Description>}
            </div>
            <DialogPrimitive.Close asChild><Button aria-label={closeLabel} data-vc-slot="close">{closeLabel}</Button></DialogPrimitive.Close>
          </div>
          {children && <div data-vc-drawer-body data-vc-slot="body">{children}</div>}
          {actions && <div data-vc-drawer-actions data-vc-slot="actions">{actions}</div>}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
