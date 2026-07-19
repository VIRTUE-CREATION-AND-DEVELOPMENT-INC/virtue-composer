"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import type { ReactNode } from "react";

export type TabItem = { id: string; label: ReactNode; content: ReactNode; disabled?: boolean };
export type TabsProps = {
  items: TabItem[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  orientation?: "horizontal" | "vertical";
  activationMode?: "automatic" | "manual";
  ariaLabel?: string;
  className?: string;
};

export default function Tabs({ items, value, defaultValue, onValueChange, orientation = "horizontal", activationMode = "automatic", ariaLabel = "Sections", className }: TabsProps) {
  const initialValue = defaultValue ?? items.find((item) => !item.disabled)?.id;
  return (
    <TabsPrimitive.Root value={value} defaultValue={initialValue} onValueChange={onValueChange} orientation={orientation} activationMode={activationMode} className={className} data-vc-component="tabs">
      <TabsPrimitive.List aria-label={ariaLabel} data-vc-tabs-list>
        {items.map((item) => <TabsPrimitive.Trigger key={item.id} value={item.id} disabled={item.disabled} data-vc-tabs-trigger>{item.label}</TabsPrimitive.Trigger>)}
      </TabsPrimitive.List>
      {items.map((item) => <TabsPrimitive.Content key={item.id} value={item.id} data-vc-tabs-content>{item.content}</TabsPrimitive.Content>)}
    </TabsPrimitive.Root>
  );
}
