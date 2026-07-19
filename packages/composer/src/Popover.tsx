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
  className?: string;
};

export default function Popover({ trigger, children, title, open, defaultOpen, onOpenChange, side = "bottom", align = "center", className }: PopoverProps) {
  return (
    <PopoverPrimitive.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      <PopoverPrimitive.Trigger asChild>{trigger}</PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content side={side} align={align} sideOffset={8} className={className} data-vc-component="popover">
          {title && <div data-vc-popover-title>{title}</div>}
          <div data-vc-popover-body>{children}</div>
          <PopoverPrimitive.Arrow data-vc-popover-arrow />
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
