"use client";

import * as HoverCardPrimitive from "@radix-ui/react-hover-card";
import type { ReactElement, ReactNode } from "react";

export type HoverCardProps = { trigger: ReactElement; children: ReactNode; open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void; openDelay?: number; closeDelay?: number; side?: "top" | "right" | "bottom" | "left"; align?: "start" | "center" | "end"; className?: string };

export default function HoverCard({ trigger, children, open, defaultOpen, onOpenChange, openDelay = 500, closeDelay = 300, side = "bottom", align = "center", className }: HoverCardProps) {
  return <HoverCardPrimitive.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange} openDelay={openDelay} closeDelay={closeDelay}><HoverCardPrimitive.Trigger asChild>{trigger}</HoverCardPrimitive.Trigger><HoverCardPrimitive.Portal><HoverCardPrimitive.Content side={side} align={align} sideOffset={8} className={className} data-vc-component="hover-card">{children}<HoverCardPrimitive.Arrow data-vc-hover-card-arrow /></HoverCardPrimitive.Content></HoverCardPrimitive.Portal></HoverCardPrimitive.Root>;
}
