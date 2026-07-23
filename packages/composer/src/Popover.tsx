"use client";

import * as PopoverPrimitive from "@radix-ui/react-popover";
import type { ReactElement, ReactNode } from "react";

export type PopoverProps = {
  trigger: ReactElement;
  children: ReactNode;
  title?: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  modal?: boolean;
  sideOffset?: number;
  collisionPadding?: number;
  avoidCollisions?: boolean;
  className?: string;
};

export default function Popover({ trigger, children, title, open, defaultOpen, onOpenChange, side = "bottom", align = "center", modal = false, sideOffset = 8, collisionPadding = 8, avoidCollisions = true, className }: PopoverProps) {
  return (
    <PopoverPrimitive.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange} modal={modal}>
      <PopoverPrimitive.Trigger asChild>{trigger}</PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content side={side} align={align} sideOffset={sideOffset} collisionPadding={collisionPadding} avoidCollisions={avoidCollisions} className={className} data-vc-component="popover" data-vc-slot="root">
          {title && <div data-vc-popover-title data-vc-slot="title">{title}</div>}
          <div data-vc-popover-body data-vc-slot="body">{children}</div>
          <PopoverPrimitive.Arrow data-vc-popover-arrow data-vc-slot="arrow" />
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
