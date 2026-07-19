"use client";

import * as SliderPrimitive from "@radix-ui/react-slider";
import { useState } from "react";

export type SliderProps = { label: string; value?: number[]; defaultValue?: number[]; onValueChange?: (value: number[]) => void; min?: number; max?: number; step?: number; disabled?: boolean; name?: string; showValue?: boolean; className?: string };

export default function Slider({ label, value, defaultValue = [0], onValueChange, min = 0, max = 100, step = 1, disabled, name, showValue = false, className }: SliderProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const current = value ?? internalValue;
  const handleValueChange = (nextValue: number[]) => {
    if (value === undefined) setInternalValue(nextValue);
    onValueChange?.(nextValue);
  };
  return <div className={className} data-vc-component="slider"><div data-vc-slider-label><span>{label}</span>{showValue && <span aria-hidden="true">{current.join(" – ")}</span>}</div><SliderPrimitive.Root value={value} defaultValue={defaultValue} onValueChange={handleValueChange} min={min} max={max} step={step} disabled={disabled} name={name} data-vc-slider-root><SliderPrimitive.Track data-vc-slider-track><SliderPrimitive.Range data-vc-slider-range /></SliderPrimitive.Track>{current.map((_, index) => <SliderPrimitive.Thumb key={index} aria-label={current.length > 1 ? `${label} ${index + 1}` : label} data-vc-slider-thumb />)}</SliderPrimitive.Root></div>;
}
