"use client";

import { useState, type ReactNode } from "react";

export type DisclosureProps = { summary: ReactNode; children: ReactNode; open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void; disabled?: boolean; className?: string };

export default function Disclosure({ summary, children, open, defaultOpen = false, onOpenChange, disabled = false, className }: DisclosureProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const resolvedOpen = open ?? internalOpen;
  return (
    <details open={resolvedOpen} className={className} data-vc-component="disclosure" onToggle={(event) => {
      const nextOpen = event.currentTarget.open;
      if (open === undefined) setInternalOpen(nextOpen);
      onOpenChange?.(nextOpen);
    }}>
      <summary aria-disabled={disabled || undefined} onClick={(event) => { if (disabled) event.preventDefault(); }} data-vc-disclosure-trigger>{summary}</summary>
      <div data-vc-disclosure-content>{children}</div>
    </details>
  );
}
