"use client";

import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import type { ReactElement, ReactNode } from "react";
import Button from "./Button";

export type AlertDialogProps = { trigger: ReactElement; title: string; description: string; confirmLabel?: ReactNode; cancelLabel?: ReactNode; onConfirm: () => void | Promise<void>; destructive?: boolean; open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void; children?: ReactNode; className?: string };

export default function AlertDialog({ trigger, title, description, confirmLabel = "Confirm", cancelLabel = "Cancel", onConfirm, destructive = false, open, defaultOpen, onOpenChange, children, className }: AlertDialogProps) {
  return <AlertDialogPrimitive.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}><AlertDialogPrimitive.Trigger asChild>{trigger}</AlertDialogPrimitive.Trigger><AlertDialogPrimitive.Portal><AlertDialogPrimitive.Overlay data-vc-alert-dialog-overlay /><AlertDialogPrimitive.Content className={className} data-vc-component="alert-dialog" data-vc-slot="root"><AlertDialogPrimitive.Title>{title}</AlertDialogPrimitive.Title><AlertDialogPrimitive.Description>{description}</AlertDialogPrimitive.Description>{children && <div data-vc-alert-dialog-body>{children}</div>}<div data-vc-alert-dialog-actions><AlertDialogPrimitive.Cancel asChild><Button>{cancelLabel}</Button></AlertDialogPrimitive.Cancel><AlertDialogPrimitive.Action asChild><Button data-vc-destructive={destructive || undefined} onClick={() => void onConfirm()}>{confirmLabel}</Button></AlertDialogPrimitive.Action></div></AlertDialogPrimitive.Content></AlertDialogPrimitive.Portal></AlertDialogPrimitive.Root>;
}
