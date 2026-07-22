"use client";

import * as ToggleGroup from "@radix-ui/react-toggle-group";
import type { ReactNode } from "react";

export type SegmentedControlItem = { value: string; label: ReactNode; icon?: ReactNode; disabled?: boolean };
export type SegmentedControlProps = { items: SegmentedControlItem[]; value?: string; defaultValue?: string; onValueChange?: (value: string) => void; ariaLabel: string; className?: string };

export default function SegmentedControl({ items, value, defaultValue, onValueChange, ariaLabel, className }: SegmentedControlProps) {
  return <ToggleGroup.Root type="single" value={value} defaultValue={defaultValue} onValueChange={onValueChange} aria-label={ariaLabel} className={className} data-vc-component="segmented-control" data-vc-slot="root">{items.map((item) => <ToggleGroup.Item key={item.value} value={item.value} disabled={item.disabled} aria-label={typeof item.label === "string" ? item.label : undefined} data-vc-segmented-item>{item.icon && <span aria-hidden="true">{item.icon}</span>}<span>{item.label}</span></ToggleGroup.Item>)}</ToggleGroup.Root>;
}
