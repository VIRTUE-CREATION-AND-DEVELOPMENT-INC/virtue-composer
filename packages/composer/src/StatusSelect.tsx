"use client";

import { useState } from "react";

export type StatusSelectOption = { value: string; label: string; tone?: "neutral" | "info" | "success" | "warning" | "danger"; disabled?: boolean; description?: string };
export type StatusSelectProps = { label: string; options: StatusSelectOption[]; value?: string; defaultValue?: string; onValueChange?: (value: string) => void; name?: string; disabled?: boolean; required?: boolean; className?: string };

export default function StatusSelect({ label, options, value, defaultValue = "", onValueChange, name, disabled, required, className }: StatusSelectProps) {
  const [internal, setInternal] = useState(defaultValue);
  const selected = value ?? internal;
  const option = options.find((item) => item.value === selected);
  const change = (next: string) => { if (value === undefined) setInternal(next); onValueChange?.(next); };
  return <label className={className} data-vc-component="status-select" data-vc-tone={option?.tone}>
    <span>{label}{required && <span aria-hidden="true"> *</span>}</span>
    <select name={name} value={selected} onChange={(event) => change(event.currentTarget.value)} disabled={disabled} required={required}>
      {!required && <option value="">Select status</option>}
      {options.map((item) => <option key={item.value} value={item.value} disabled={item.disabled}>{item.label}{item.description ? ` — ${item.description}` : ""}</option>)}
    </select>
  </label>;
}
