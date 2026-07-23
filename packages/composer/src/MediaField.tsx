"use client";

import { useId, type ReactNode } from "react";
import useControllableState from "./useControllableState";

export type MediaFieldValue = { id?: string; src: string; alt?: string; title?: string; type?: "image" | "video" | "file" };
export type MediaFieldProps = { label: string; value?: MediaFieldValue; defaultValue?: MediaFieldValue; onValueChange?: (value: MediaFieldValue | undefined) => void; picker?: ReactNode; upload?: ReactNode; description?: string; error?: string; required?: boolean; name?: string; className?: string };

export default function MediaField({ label, value, defaultValue, onValueChange, picker, upload, description, error, required, name, className }: MediaFieldProps) {
  const id = useId();
  const [selected, setSelected] = useControllableState<MediaFieldValue | undefined>({ value, defaultValue, onChange: onValueChange });
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  return <fieldset className={className} aria-describedby={[descriptionId, errorId].filter(Boolean).join(" ") || undefined} aria-invalid={error ? true : undefined} data-vc-component="media-field" data-vc-slot="root" data-vc-state={error ? "error" : selected ? "selected" : "empty"}>
    <legend data-vc-slot="label">{label}{required && <span aria-hidden="true"> *</span>}</legend>
    {description && <p id={descriptionId} data-vc-slot="description">{description}</p>}
    {selected ? <div data-vc-media-field-preview data-vc-slot="preview">
      {selected.type === "video" ? <video src={selected.src} aria-label={selected.alt ?? selected.title ?? label} controls data-vc-slot="media" /> : selected.type === "file" ? <a href={selected.src} data-vc-slot="media">{selected.title ?? "Open file"}</a> : <img src={selected.src} alt={selected.alt ?? ""} data-vc-slot="media" />}
      {selected.title && <strong data-vc-slot="title">{selected.title}</strong>}
      <button type="button" onClick={() => setSelected(undefined)} data-vc-slot="clear">Clear {label}</button>
    </div> : <p data-vc-media-field-empty data-vc-slot="empty">No media selected</p>}
    <div data-vc-media-field-actions data-vc-slot="actions">{picker}{upload}</div>
    {name && <input type="hidden" name={name} value={selected?.id ?? selected?.src ?? ""} required={required} data-vc-slot="hidden-input" />}
    {error && <p id={errorId} role="alert" data-vc-slot="error">{error}</p>}
  </fieldset>;
}
