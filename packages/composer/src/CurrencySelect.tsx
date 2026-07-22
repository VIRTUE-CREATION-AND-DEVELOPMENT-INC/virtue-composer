"use client";

import { useState } from "react";

export type CurrencyOption = { code: string; name: string; symbol?: string; region?: string; disabled?: boolean };
export type CurrencySelectProps = { label: string; options: CurrencyOption[]; value?: string; defaultValue?: string; onValueChange?: (value: string) => void; compact?: boolean; name?: string; disabled?: boolean; required?: boolean; className?: string };

export default function CurrencySelect({ label, options, value, defaultValue = "", onValueChange, compact, name, disabled, required, className }: CurrencySelectProps) {
  const [internal, setInternal] = useState(defaultValue);
  const selected = value ?? internal;
  const change = (next: string) => { if (value === undefined) setInternal(next); onValueChange?.(next); };
  return <label className={className} data-vc-component="currency-select" data-vc-slot="root" data-vc-compact={compact || undefined}>
    <span>{label}</span>
    <select name={name} value={selected} onChange={(event) => change(event.currentTarget.value)} disabled={disabled} required={required}>
      {!required && <option value="">Select currency</option>}
      {options.map((option) => <option key={option.code} value={option.code} disabled={option.disabled}>{compact ? `${option.symbol ?? ""} ${option.code}`.trim() : `${option.name} (${option.code})${option.region ? ` — ${option.region}` : ""}`}</option>)}
    </select>
  </label>;
}
