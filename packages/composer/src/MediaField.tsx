"use client";

import { useId, type ReactNode } from "react";

export type MediaFieldValue = { id?: string; src: string; alt?: string; title?: string; type?: "image" | "video" | "file" };
export type MediaFieldProps = { label: string; value?: MediaFieldValue; onValueChange?: (value: MediaFieldValue | undefined) => void; picker?: ReactNode; upload?: ReactNode; description?: string; error?: string; required?: boolean; name?: string; className?: string };

export default function MediaField({ label, value, onValueChange, picker, upload, description, error, required, name, className }: MediaFieldProps) {
  const id = useId();
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  return <fieldset className={className} aria-describedby={[descriptionId, errorId].filter(Boolean).join(" ") || undefined} aria-invalid={error ? true : undefined} data-vc-component="media-field">
    <legend>{label}{required && <span aria-hidden="true"> *</span>}</legend>
    {description && <p id={descriptionId}>{description}</p>}
    {value ? <div data-vc-media-field-preview>
      {value.type === "video" ? <video src={value.src} aria-label={value.alt ?? value.title ?? label} controls /> : value.type === "file" ? <a href={value.src}>{value.title ?? "Open file"}</a> : <img src={value.src} alt={value.alt ?? ""} />}
      {value.title && <strong>{value.title}</strong>}
      <button type="button" onClick={() => onValueChange?.(undefined)}>Clear {label}</button>
    </div> : <p data-vc-media-field-empty>No media selected</p>}
    <div data-vc-media-field-actions>{picker}{upload}</div>
    {name && <input type="hidden" name={name} value={value?.id ?? value?.src ?? ""} required={required} />}
    {error && <p id={errorId} role="alert">{error}</p>}
  </fieldset>;
}
