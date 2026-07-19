"use client";

import * as Popover from "@radix-ui/react-popover";
import { Command } from "cmdk";
import { useState, type ReactNode } from "react";

export type RelationSelectOption = { value: string; label: string; description?: string; metadata?: ReactNode; keywords?: string[]; disabled?: boolean };
export type RelationSelectProps = { label: string; options: RelationSelectOption[]; value?: string[]; defaultValue?: string[]; onValueChange?: (values: string[]) => void; multiple?: boolean; loading?: boolean; error?: ReactNode; name?: string; required?: boolean; disabled?: boolean; className?: string };

export default function RelationSelect({ label, options, value, defaultValue = [], onValueChange, multiple = true, loading, error, name, required, disabled, className }: RelationSelectProps) {
  const [open, setOpen] = useState(false);
  const [internal, setInternal] = useState(defaultValue);
  const selected = value ?? internal;
  const update = (next: string[]) => { if (value === undefined) setInternal(next); onValueChange?.(next); };
  const toggle = (id: string) => {
    update(multiple ? (selected.includes(id) ? selected.filter((item) => item !== id) : [...selected, id]) : [id]);
    if (!multiple) setOpen(false);
  };
  return <div className={className} data-vc-component="relation-select">
    <span data-vc-relation-label>{label}{required && <span aria-hidden="true"> *</span>}</span>
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild><button type="button" role="combobox" aria-label={label} aria-expanded={open} aria-required={required || undefined} disabled={disabled}>{selected.length ? `${selected.length} selected` : "Select relations"}</button></Popover.Trigger>
      <Popover.Portal><Popover.Content align="start" data-vc-relation-content>
        <Command>
          <Command.Input aria-label={`Search ${label}`} placeholder="Search relations" />
          <Command.List aria-multiselectable={multiple || undefined}>
            {loading && <div role="status">Loading relations</div>}
            {error && <div role="alert">{error}</div>}
            {!loading && !error && <Command.Empty>No relations found</Command.Empty>}
            {!loading && !error && options.map((option) => <Command.Item key={option.value} value={option.label} keywords={option.keywords} disabled={option.disabled} onSelect={() => toggle(option.value)} aria-selected={selected.includes(option.value)}>
              <span>{option.label}</span>{option.description && <small>{option.description}</small>}{option.metadata}
            </Command.Item>)}
          </Command.List>
        </Command>
      </Popover.Content></Popover.Portal>
    </Popover.Root>
    {selected.length > 0 && <ul aria-label={`Selected ${label}`}>{selected.map((id) => {
      const option = options.find((item) => item.value === id);
      return <li key={id}>{option?.label ?? id}<button type="button" onClick={() => update(selected.filter((item) => item !== id))}>Remove {option?.label ?? id}</button></li>;
    })}</ul>}
    {name && selected.map((id) => <input key={id} type="hidden" name={name} value={id} />)}
  </div>;
}
