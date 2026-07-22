"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import type { ReactElement, ReactNode } from "react";
import Button from "./Button";

export type DialogProps = {
  trigger: ReactElement;
  title: string;
  description?: string;
  children?: ReactNode;
  actions?: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
};

export default function Dialog({ trigger, title, description, children, actions, open, defaultOpen, onOpenChange, className }: DialogProps) {
  return (
    <DialogPrimitive.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay data-vc-dialog-overlay data-vc-slot="overlay" />
        <DialogPrimitive.Content className={className} data-vc-component="dialog" data-vc-slot="root">
          <div data-vc-dialog-header data-vc-slot="header">
            <div data-vc-slot="heading">
              <DialogPrimitive.Title data-vc-slot="title">{title}</DialogPrimitive.Title>
              {description && <DialogPrimitive.Description data-vc-slot="description">{description}</DialogPrimitive.Description>}
            </div>
            <DialogPrimitive.Close asChild>
              <Button aria-label="Close dialog" data-vc-slot="close">Close</Button>
            </DialogPrimitive.Close>
          </div>
          {children && <div data-vc-dialog-body data-vc-slot="body">{children}</div>}
          {actions && <div data-vc-dialog-actions data-vc-slot="actions">{actions}</div>}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
