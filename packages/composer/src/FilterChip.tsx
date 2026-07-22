"use client";

import { useState } from "react";

export type FilterChipProps = { label: string; pressed?: boolean; defaultPressed?: boolean; onPressedChange?: (pressed: boolean) => void; count?: number; removable?: boolean; onRemove?: () => void; disabled?: boolean; className?: string };

export default function FilterChip({ label, pressed, defaultPressed = false, onPressedChange, count, removable, onRemove, disabled, className }: FilterChipProps) {
  const [internal, setInternal] = useState(defaultPressed);
  const active = pressed ?? internal;
  const toggle = () => { const next = !active; if (pressed === undefined) setInternal(next); onPressedChange?.(next); };
  return <span className={className} data-vc-component="filter-chip" data-vc-slot="root" data-vc-active={active || undefined}>
    <button type="button" aria-pressed={active} onClick={toggle} disabled={disabled}>{label}{count !== undefined && <span> {count} results</span>}</button>
    {removable && <button type="button" aria-label={`Remove ${label} filter`} onClick={onRemove} disabled={disabled}>×</button>}
  </span>;
}
