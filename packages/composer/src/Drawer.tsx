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
  className?: string;
};

export default function Drawer({ trigger, title, description, children, actions, side = "right", open, defaultOpen, onOpenChange, className }: DrawerProps) {
  return (
    <DialogPrimitive.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay data-vc-drawer-overlay />
        <DialogPrimitive.Content className={className} data-vc-component="drawer" data-vc-drawer-side={side}>
          <div data-vc-drawer-header>
            <div>
              <DialogPrimitive.Title>{title}</DialogPrimitive.Title>
              {description && <DialogPrimitive.Description>{description}</DialogPrimitive.Description>}
            </div>
            <DialogPrimitive.Close asChild><Button aria-label="Close drawer">Close</Button></DialogPrimitive.Close>
          </div>
          {children && <div data-vc-drawer-body>{children}</div>}
          {actions && <div data-vc-drawer-actions>{actions}</div>}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
