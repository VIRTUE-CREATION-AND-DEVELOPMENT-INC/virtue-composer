"use client";

import { useId, useState } from "react";

export type FacetFilterOption = { value: string; label: string; count?: number; disabled?: boolean };
export type FacetFilterProps = { label: string; options: FacetFilterOption[]; value?: string[]; defaultValue?: string[]; onValueChange?: (values: string[]) => void; multiple?: boolean; collapsible?: boolean; defaultOpen?: boolean; className?: string };

export default function FacetFilter({ label, options, value, defaultValue = [], onValueChange, multiple = true, collapsible = false, defaultOpen = true, className }: FacetFilterProps) {
  const id = useId();
  const [open, setOpen] = useState(defaultOpen);
  const [internal, setInternal] = useState(defaultValue);
  const selected = value ?? internal;
  const update = (next: string[]) => { if (value === undefined) setInternal(next); onValueChange?.(next); };
  const choose = (id: string) => update(multiple ? (selected.includes(id) ? selected.filter((item) => item !== id) : [...selected, id]) : [id]);
  return <fieldset className={className} data-vc-component="facet-filter">
    <legend id={id}>{label}</legend>
    {collapsible && <button type="button" aria-expanded={open} aria-controls={`${id}-options`} onClick={() => setOpen((current) => !current)}>{open ? "Hide" : "Show"} {label}</button>}
    {open && <div id={`${id}-options`}>
      {options.map((option) => <label key={option.value}>
        <input type={multiple ? "checkbox" : "radio"} name={multiple ? undefined : id} checked={selected.includes(option.value)} onChange={() => choose(option.value)} disabled={option.disabled} />
        <span>{option.label}{option.count !== undefined && <span> ({option.count} results)</span>}</span>
      </label>)}
    </div>}
  </fieldset>;
}
