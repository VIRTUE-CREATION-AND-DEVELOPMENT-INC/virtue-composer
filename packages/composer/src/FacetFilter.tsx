"use client";

import { useId } from "react";
import useControllableState from "./useControllableState";

export type FacetFilterOption = { value: string; label: string; count?: number; disabled?: boolean };
export type FacetFilterProps = { label: string; options: FacetFilterOption[]; value?: string[]; defaultValue?: string[]; onValueChange?: (values: string[]) => void; multiple?: boolean; collapsible?: boolean; open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void; className?: string };

export default function FacetFilter({ label, options, value, defaultValue = [], onValueChange, multiple = true, collapsible = false, open, defaultOpen = true, onOpenChange, className }: FacetFilterProps) {
  const id = useId();
  const [resolvedOpen, setOpen] = useControllableState({ value: open, defaultValue: defaultOpen, onChange: onOpenChange });
  const [selected, update] = useControllableState({ value, defaultValue, onChange: onValueChange });
  const choose = (id: string) => update(multiple ? (selected.includes(id) ? selected.filter((item) => item !== id) : [...selected, id]) : [id]);
  return <fieldset className={className} data-vc-component="facet-filter" data-vc-slot="root">
    <legend id={id}>{label}</legend>
    {collapsible && <button type="button" aria-expanded={resolvedOpen} aria-controls={`${id}-options`} onClick={() => setOpen(!resolvedOpen)}>{resolvedOpen ? "Hide" : "Show"} {label}</button>}
    {resolvedOpen && <div id={`${id}-options`}>
      {options.map((option) => <label key={option.value}>
        <input type={multiple ? "checkbox" : "radio"} name={multiple ? undefined : id} checked={selected.includes(option.value)} onChange={() => choose(option.value)} disabled={option.disabled} />
        <span>{option.label}{option.count !== undefined && <span> ({option.count} results)</span>}</span>
      </label>)}
    </div>}
  </fieldset>;
}
