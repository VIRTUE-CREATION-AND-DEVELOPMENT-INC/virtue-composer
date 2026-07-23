"use client";

import { useId, type ReactNode } from "react";
import useControllableState from "./useControllableState";

export type RatingInputProps = {
  label: ReactNode;
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  max?: number;
  icon?: ReactNode;
  getLabel?: (value: number, max: number) => string;
  allowClear?: boolean;
  clearLabel?: string;
  name?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
};

export default function RatingInput({ label, value, defaultValue = 0, onValueChange, max = 5, icon = "★", getLabel = (rating, total) => `${rating} of ${total}`, allowClear = false, clearLabel = "Clear rating", name, required, disabled, readOnly, className }: RatingInputProps) {
  const generatedName = useId();
  const [selected, setSelected] = useControllableState({ value, defaultValue, onChange: onValueChange });
  const fieldName = name ?? `rating-${generatedName}`;
  return <fieldset className={className} disabled={disabled} data-vc-component="rating-input" data-vc-slot="root" data-vc-state={readOnly ? "readonly" : disabled ? "disabled" : selected ? "rated" : "empty"}>
    <legend data-vc-slot="label">{label}{required && <span aria-hidden="true"> *</span>}</legend>
    <div data-vc-slot="options">{Array.from({ length: Math.max(1, max) }, (_, index) => index + 1).map((rating) => <label key={rating} data-vc-slot="option" data-vc-active={rating <= selected || undefined}>
      <input type="radio" name={fieldName} value={rating} checked={selected === rating} onChange={() => setSelected(rating)} aria-label={getLabel(rating, max)} required={required} disabled={disabled || readOnly} />
      <span aria-hidden="true" data-vc-slot="icon">{icon}</span>
    </label>)}</div>
    <output aria-live="polite" data-vc-slot="value">{selected ? getLabel(selected, max) : "Not rated"}</output>
    {allowClear && !readOnly && <button type="button" onClick={() => setSelected(0)} disabled={disabled || selected === 0} data-vc-slot="clear">{clearLabel}</button>}
    {name && readOnly && <input type="hidden" name={name} value={selected || ""} data-vc-slot="hidden-input" />}
    {name && selected === 0 && !readOnly && <input type="hidden" name={name} value="" data-vc-slot="hidden-input" />}
  </fieldset>;
}
