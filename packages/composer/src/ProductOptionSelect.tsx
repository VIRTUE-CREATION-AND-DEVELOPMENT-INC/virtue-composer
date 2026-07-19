"use client";

import { useId, useState } from "react";

export type ProductOption = { value: string; label: string; description?: string; available?: boolean; price?: string };
export type ProductOptionSelectProps = { label: string; options: ProductOption[]; value?: string; defaultValue?: string; onValueChange?: (value: string) => void; name?: string; required?: boolean; className?: string };

export default function ProductOptionSelect({ label, options, value, defaultValue = "", onValueChange, name, required, className }: ProductOptionSelectProps) {
  const id = useId();
  const [internal, setInternal] = useState(defaultValue);
  const selected = value ?? internal;
  const change = (next: string) => { if (value === undefined) setInternal(next); onValueChange?.(next); };
  return <fieldset className={className} data-vc-component="product-option-select"><legend>{label}</legend><div>
    {options.map((option) => { const unavailable = option.available === false; const descriptionId = option.description || unavailable ? `${id}-${option.value}-description` : undefined; return <label key={option.value} data-vc-unavailable={unavailable || undefined}>
      <input type="radio" name={name ?? id} value={option.value} checked={selected === option.value} onChange={() => change(option.value)} disabled={unavailable} required={required} aria-describedby={descriptionId} />
      <span>{option.label}{option.price && <small>{option.price}</small>}</span>
      {descriptionId && <small id={descriptionId}>{option.description}{unavailable ? `${option.description ? ". " : ""}Unavailable` : ""}</small>}
    </label>; })}
  </div></fieldset>;
}
