"use client";

import { useId, useRef, useState, type ReactNode } from "react";

export type InlineEditProps = { label: string; value: string; onSave: (value: string) => void | Promise<void>; renderValue?: (value: string) => ReactNode; validate?: (value: string) => string | undefined; disabled?: boolean; pending?: boolean; className?: string };

export default function InlineEdit({ label, value, onSave, renderValue, validate, disabled, pending: externalPending, className }: InlineEditProps) {
  const id = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [error, setError] = useState<string>();
  const [internalPending, setInternalPending] = useState(false);
  const pending = externalPending ?? internalPending;
  const cancel = () => { setDraft(value); setError(undefined); setEditing(false); queueMicrotask(() => triggerRef.current?.focus()); };
  const save = async () => {
    const nextError = validate?.(draft);
    if (nextError) { setError(nextError); return; }
    setInternalPending(true);
    try { await onSave(draft); setEditing(false); queueMicrotask(() => triggerRef.current?.focus()); } finally { setInternalPending(false); }
  };
  return <div className={className} data-vc-component="inline-edit" data-vc-editing={editing || undefined}>
    {editing ? <div role="group" aria-labelledby={`${id}-label`}>
      <label id={`${id}-label`} htmlFor={id}>{label}</label>
      <input id={id} autoFocus value={draft} onChange={(event) => { setDraft(event.currentTarget.value); setError(undefined); }} aria-invalid={Boolean(error) || undefined} aria-describedby={error ? `${id}-error` : undefined} disabled={pending} />
      {error && <span id={`${id}-error`} role="alert">{error}</span>}
      <button type="button" onClick={save} disabled={pending}>{pending ? "Saving…" : "Save"}</button>
      <button type="button" onClick={cancel} disabled={pending}>Cancel</button>
    </div> : <div>
      <span>{renderValue ? renderValue(value) : value}</span>
      <button ref={triggerRef} type="button" onClick={() => { setDraft(value); setEditing(true); }} disabled={disabled}>Edit {label}</button>
    </div>}
  </div>;
}
