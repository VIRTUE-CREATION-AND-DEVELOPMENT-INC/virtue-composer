"use client";

import { useEffect, useId, useState } from "react";
import useControllableState from "./useControllableState";

export type ColorPickerPreset = { value: string; label: string };
export type ColorPickerProps = {
  label: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  presets?: ColorPickerPreset[];
  description?: string;
  error?: string;
  name?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
};

const colorPattern = /^#[0-9a-f]{6}$/i;

export default function ColorPicker({ label, value, defaultValue = "#0f6b5b", onValueChange, presets = [], description, error, name, required, disabled, className }: ColorPickerProps) {
  const id = useId();
  const [selected, setSelected] = useControllableState({ value, defaultValue, onChange: onValueChange });
  const [draft, setDraft] = useState(selected);
  const invalid = !colorPattern.test(draft);
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = error || invalid ? `${id}-error` : undefined;
  const update = (next: string) => { setDraft(next); if (colorPattern.test(next)) setSelected(next.toLowerCase()); };
  useEffect(() => { if (value !== undefined && colorPattern.test(value)) setDraft(value); }, [value]);

  return <div className={className} data-vc-component="color-picker" data-vc-slot="root" data-vc-state={disabled ? "disabled" : error || invalid ? "invalid" : "ready"}>
    <label htmlFor={id} data-vc-slot="label">{label}{required && <span aria-hidden="true"> *</span>}</label>
    {description && <p id={descriptionId} data-vc-slot="description">{description}</p>}
    <div data-vc-slot="controls">
      <input id={id} type="color" value={colorPattern.test(selected) ? selected : "#000000"} onChange={(event) => update(event.currentTarget.value)} aria-describedby={[descriptionId, errorId].filter(Boolean).join(" ") || undefined} disabled={disabled} data-vc-slot="native-control" />
      <input type="text" value={draft} onChange={(event) => update(event.currentTarget.value)} onBlur={() => invalid && setDraft(selected)} aria-label={`${label} value`} aria-invalid={Boolean(error) || invalid || undefined} aria-describedby={errorId} disabled={disabled} required={required} spellCheck={false} data-vc-slot="text-control" />
    </div>
    {presets.length > 0 && <div role="group" aria-label={`${label} presets`} data-vc-slot="presets">{presets.map((preset) => <button key={preset.value} type="button" aria-label={preset.label} aria-pressed={selected.toLowerCase() === preset.value.toLowerCase()} onClick={() => update(preset.value)} disabled={disabled} style={{ "--vc-color-swatch": preset.value } as React.CSSProperties} data-vc-slot="preset"><span aria-hidden="true" /></button>)}</div>}
    {(error || invalid) && <p id={errorId} role="alert" data-vc-slot="error">{error ?? "Enter a six-digit hexadecimal color."}</p>}
    {name && <input type="hidden" name={name} value={selected} data-vc-slot="hidden-input" />}
  </div>;
}
