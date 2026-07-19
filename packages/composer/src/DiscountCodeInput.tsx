"use client";

import { useId, useState, type FormEvent } from "react";

export type DiscountCodeInputProps = { label: string; value?: string; defaultValue?: string; onApply: (code: string) => void; onRemove?: () => void; appliedCode?: string; pending?: boolean; success?: string; error?: string; disabled?: boolean; className?: string };

export default function DiscountCodeInput({ label, value, defaultValue = "", onApply, onRemove, appliedCode, pending, success, error, disabled, className }: DiscountCodeInputProps) {
  const id = useId();
  const [internal, setInternal] = useState(defaultValue);
  const current = value ?? internal;
  const submit = (event: FormEvent) => { event.preventDefault(); if (current.trim()) onApply(current.trim()); };
  return <form className={className} onSubmit={submit} aria-busy={pending || undefined} data-vc-component="discount-code-input">
    {appliedCode ? <div data-vc-discount-applied><span>Applied code: <strong>{appliedCode}</strong></span>{onRemove && <button type="button" onClick={onRemove} disabled={pending || disabled}>Remove {appliedCode}</button>}</div> : <div>
      <label htmlFor={id}>{label}</label>
      <input id={id} value={current} onChange={(event) => { if (value === undefined) setInternal(event.currentTarget.value); }} disabled={pending || disabled} aria-invalid={Boolean(error) || undefined} aria-describedby={error ? `${id}-message` : success ? `${id}-message` : undefined} />
      <button type="submit" disabled={!current.trim() || pending || disabled}>{pending ? "Applying…" : "Apply"}</button>
    </div>}
    {(error || success) && <p id={`${id}-message`} role={error ? "alert" : "status"}>{error ?? success}</p>}
  </form>;
}
