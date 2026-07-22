"use client";

import { useId, useState, type ChangeEvent } from "react";

export type NumberInputProps = { label: string; value?: number; defaultValue?: number; onValueChange?: (value: number | undefined) => void; min?: number; max?: number; step?: number; name?: string; disabled?: boolean; required?: boolean; description?: string; error?: string; className?: string };

export default function NumberInput({ label, value, defaultValue, onValueChange, min, max, step = 1, name, disabled, required, description, error, className }: NumberInputProps) {
  const id = useId();
  const [internal, setInternal] = useState<number | undefined>(defaultValue);
  const current = value ?? internal;
  const commit = (next: number | undefined) => {
    const bounded = next === undefined ? undefined : Math.min(Math.max(next, min ?? -Infinity), max ?? Infinity);
    if (value === undefined) setInternal(bounded);
    onValueChange?.(bounded);
  };
  const change = (event: ChangeEvent<HTMLInputElement>) => commit(event.currentTarget.value === "" ? undefined : event.currentTarget.valueAsNumber);
  return <div className={className} data-vc-component="number-input" data-vc-slot="root" data-vc-invalid={Boolean(error) || undefined}>
    <label htmlFor={id}>{label}{required && <span aria-hidden="true"> *</span>}</label>
    {description && <p id={`${id}-description`}>{description}</p>}
    <div data-vc-number-control>
      <button type="button" aria-label={`Decrease ${label}`} disabled={disabled || (min !== undefined && (current ?? min) <= min)} onClick={() => commit((current ?? 0) - step)} data-vc-number-step="decrease">−</button>
      <input id={id} type="number" name={name} value={current ?? ""} min={min} max={max} step={step} disabled={disabled} required={required} aria-describedby={description ? `${id}-description` : undefined} aria-invalid={Boolean(error) || undefined} onChange={change} />
      <button type="button" aria-label={`Increase ${label}`} disabled={disabled || (max !== undefined && (current ?? max) >= max)} onClick={() => commit((current ?? 0) + step)} data-vc-number-step="increase">+</button>
    </div>
    {error && <p role="alert" data-vc-number-error>{error}</p>}
  </div>;
}
