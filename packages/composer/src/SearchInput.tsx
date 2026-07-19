"use client";

import { useEffect, useId, useState, type FormEvent } from "react";

export type SearchInputProps = { label: string; value?: string; defaultValue?: string; onValueChange?: (value: string) => void; onSearch?: (value: string) => void; placeholder?: string; debounceMs?: number; loading?: boolean; clearLabel?: string; name?: string; disabled?: boolean; className?: string };

export default function SearchInput({ label, value, defaultValue = "", onValueChange, onSearch, placeholder, debounceMs = 250, loading, clearLabel = "Clear search", name = "query", disabled, className }: SearchInputProps) {
  const id = useId();
  const [internal, setInternal] = useState(defaultValue);
  const current = value ?? internal;
  useEffect(() => {
    if (!onSearch) return;
    const timer = window.setTimeout(() => onSearch(current), debounceMs);
    return () => window.clearTimeout(timer);
  }, [current, debounceMs, onSearch]);
  const update = (next: string) => { if (value === undefined) setInternal(next); onValueChange?.(next); };
  const submit = (event: FormEvent) => { event.preventDefault(); onSearch?.(current); };
  return <form role="search" aria-label={label} className={className} onSubmit={submit} data-vc-component="search-input">
    <label htmlFor={id}>{label}</label>
    <div data-vc-search-control>
      <input id={id} type="search" name={name} value={current} onChange={(event) => update(event.currentTarget.value)} placeholder={placeholder} disabled={disabled} aria-busy={loading || undefined} />
      {current && <button type="button" aria-label={clearLabel} onClick={() => update("")} disabled={disabled}>×</button>}
      <button type="submit" disabled={disabled || loading}>{loading ? "Searching…" : "Search"}</button>
    </div>
    {loading && <span role="status">Searching</span>}
  </form>;
}
