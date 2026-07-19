"use client";

import { useState } from "react";
import Slider from "./Slider";

export type PriceRangeInputProps = { label: string; value?: [number, number]; defaultValue?: [number, number]; onValueChange?: (value: [number, number]) => void; min?: number; max?: number; step?: number; currency: string; locale?: string; minName?: string; maxName?: string; disabled?: boolean; className?: string };

export default function PriceRangeInput({ label, value, defaultValue = [0, 100], onValueChange, min = 0, max = 1000, step = 1, currency, locale = "en-US", minName, maxName, disabled, className }: PriceRangeInputProps) {
  const [internal, setInternal] = useState<[number, number]>(defaultValue);
  const current = value ?? internal;
  const formatter = new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: 0 });
  const commit = (next: [number, number]) => {
    const ordered: [number, number] = [Math.max(min, Math.min(next[0], next[1])), Math.min(max, Math.max(next[0], next[1]))];
    if (value === undefined) setInternal(ordered);
    onValueChange?.(ordered);
  };
  return <fieldset className={className} data-vc-component="price-range-input"><legend>{label}</legend>
    <Slider label={label} value={current} onValueChange={(next) => commit([next[0], next[1]])} min={min} max={max} step={step} disabled={disabled} />
    <div data-vc-price-fields>
      <label>Minimum ({currency})<input type="number" name={minName} min={min} max={current[1]} step={step} value={current[0]} onChange={(event) => commit([Number(event.currentTarget.value), current[1]])} disabled={disabled} /></label>
      <label>Maximum ({currency})<input type="number" name={maxName} min={current[0]} max={max} step={step} value={current[1]} onChange={(event) => commit([current[0], Number(event.currentTarget.value)])} disabled={disabled} /></label>
    </div>
    <output>{formatter.format(current[0])} – {formatter.format(current[1])}</output>
  </fieldset>;
}
