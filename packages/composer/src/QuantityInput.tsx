"use client";

import { useId, useState } from "react";

export type QuantityInputProps = { label: string; value?: number; defaultValue?: number; onValueChange?: (value: number, reason: "increment" | "decrement" | "input") => void; min?: number; max?: number; allowRemove?: boolean; onRemove?: () => void; pending?: boolean; stockMessage?: string; name?: string; disabled?: boolean; className?: string };

export default function QuantityInput({ label, value, defaultValue = 1, onValueChange, min = 1, max, allowRemove, onRemove, pending, stockMessage, name, disabled, className }: QuantityInputProps) {
  const id = useId();
  const [internal, setInternal] = useState(defaultValue);
  const current = value ?? internal;
  const commit = (next: number, reason: "increment" | "decrement" | "input") => {
    const bounded = Math.max(min, Math.min(max ?? next, next));
    if (value === undefined) setInternal(bounded);
    onValueChange?.(bounded, reason);
  };
  const blocked = disabled || pending;
  return <div className={className} aria-busy={pending || undefined} data-vc-component="quantity-input">
    <label htmlFor={id}>{label}</label>
    <div data-vc-quantity-controls>
      {allowRemove && current <= min ? <button type="button" onClick={onRemove} disabled={blocked}>Remove {label}</button> : <button type="button" aria-label={`Decrease ${label}`} onClick={() => commit(current - 1, "decrement")} disabled={blocked || current <= min}>−</button>}
      <input id={id} type="number" inputMode="numeric" name={name} value={current} min={min} max={max} onChange={(event) => commit(Number(event.currentTarget.value), "input")} disabled={blocked} />
      <button type="button" aria-label={`Increase ${label}`} onClick={() => commit(current + 1, "increment")} disabled={blocked || (max !== undefined && current >= max)}>+</button>
    </div>
    {stockMessage && <p aria-live="polite">{stockMessage}</p>}
  </div>;
}
