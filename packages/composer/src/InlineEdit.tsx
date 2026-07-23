"use client";

import { useId, useRef, useState, type ReactNode } from "react";

export type InlineEditProps = { label: string; value: string; onSave: (value: string) => void | string | undefined | Promise<void | string | undefined>; renderValue?: (value: string) => ReactNode; validate?: (value: string) => string | undefined | Promise<string | undefined>; onCancel?: () => void; onError?: (error: unknown) => void; rollbackOnError?: boolean; saveErrorMessage?: string; disabled?: boolean; pending?: boolean; className?: string };

export default function InlineEdit({ label, value, onSave, renderValue, validate, onCancel, onError, rollbackOnError = false, saveErrorMessage = "Could not save this value.", disabled, pending: externalPending, className }: InlineEditProps) {
  const id = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [error, setError] = useState<string>();
  const [internalPending, setInternalPending] = useState(false);
  const pending = externalPending ?? internalPending;
  const cancel = () => { setDraft(value); setError(undefined); setEditing(false); onCancel?.(); queueMicrotask(() => triggerRef.current?.focus()); };
  const save = async () => {
    const nextError = await validate?.(draft);
    if (nextError) { setError(nextError); return; }
    setInternalPending(true);
    try { const serverError = await onSave(draft); if (typeof serverError === "string") { setError(serverError); if (rollbackOnError) setDraft(value); return; } setEditing(false); queueMicrotask(() => triggerRef.current?.focus()); }
    catch (reason) { setError(reason instanceof Error ? reason.message : saveErrorMessage); if (rollbackOnError) setDraft(value); onError?.(reason); }
    finally { setInternalPending(false); }
  };
  return <div className={className} data-vc-component="inline-edit" data-vc-slot="root" data-vc-editing={editing || undefined}>
    {editing ? <div role="group" aria-labelledby={`${id}-label`} data-vc-inline-edit-form data-vc-slot="form">
      <div data-vc-inline-edit-field data-vc-slot="field">
        <label id={`${id}-label`} htmlFor={id}>{label}</label>
        <input id={id} autoFocus value={draft} onChange={(event) => { setDraft(event.currentTarget.value); setError(undefined); }} aria-invalid={Boolean(error) || undefined} aria-describedby={error ? `${id}-error` : undefined} disabled={pending} />
        {error && <span id={`${id}-error`} role="alert">{error}</span>}
      </div>
      <div data-vc-inline-edit-actions data-vc-slot="actions">
        <button type="button" onClick={save} disabled={pending}>{pending ? "Saving…" : "Save"}</button>
        <button type="button" onClick={cancel} disabled={pending}>Cancel</button>
      </div>
    </div> : <div data-vc-inline-edit-view data-vc-slot="view">
      <span data-vc-inline-edit-value data-vc-slot="value">{renderValue ? renderValue(value) : value}</span>
      <button ref={triggerRef} type="button" onClick={() => { setDraft(value); setEditing(true); }} disabled={disabled} data-vc-slot="edit">Edit {label}</button>
    </div>}
  </div>;
}
