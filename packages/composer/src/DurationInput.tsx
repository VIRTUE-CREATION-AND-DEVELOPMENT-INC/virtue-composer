"use client";

import { useId, useState } from "react";

export type DurationUnit = "hours" | "minutes";
export type DurationInputProps = { label: string; value?: number; defaultValue?: number; onValueChange?: (minutes: number) => void; units?: DurationUnit[]; min?: number; max?: number; name?: string; required?: boolean; disabled?: boolean; description?: string; error?: string; className?: string };

export default function DurationInput({ label, value, defaultValue = 0, onValueChange, units = ["hours", "minutes"], min = 0, max, name, required, disabled, description, error, className }: DurationInputProps) {
  const id = useId();
  const [internal, setInternal] = useState(defaultValue);
  const total = value ?? internal;
  const clamp = (next: number) => Math.max(min, Math.min(max ?? next, next));
  const commit = (next: number) => { const bounded = clamp(next); if (value === undefined) setInternal(bounded); onValueChange?.(bounded); };
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  return <fieldset className={className} aria-describedby={[description ? `${id}-description` : "", error ? `${id}-error` : ""].filter(Boolean).join(" ") || undefined} data-vc-component="duration-input">
    <legend>{label}{required && <span aria-hidden="true"> *</span>}</legend>
    {description && <p id={`${id}-description`}>{description}</p>}
    <div data-vc-duration-controls>
      {units.includes("hours") && <label>Hours <input type="number" min={0} value={hours} onChange={(event) => commit(Number(event.currentTarget.value) * 60 + minutes)} disabled={disabled} /></label>}
      {units.includes("minutes") && <label>Minutes <input type="number" min={0} max={59} value={units.includes("hours") ? minutes : total} onChange={(event) => commit(units.includes("hours") ? hours * 60 + Number(event.currentTarget.value) : Number(event.currentTarget.value))} disabled={disabled} /></label>}
    </div>
    <output>{total} minutes</output>
    {name && <input type="hidden" name={name} value={total} required={required} />}
    {error && <p id={`${id}-error`} role="alert">{error}</p>}
  </fieldset>;
}
