"use client";

import * as Popover from "@radix-ui/react-popover";
import { Command } from "cmdk";
import { useState, type ReactNode } from "react";
import useControllableState from "./useControllableState";

export type RelationSelectOption = { value: string; label: string; description?: string; metadata?: ReactNode; keywords?: string[]; disabled?: boolean };
export type RelationSelectProps = { label: string; options: RelationSelectOption[]; value?: string[]; defaultValue?: string[]; onValueChange?: (values: string[]) => void; multiple?: boolean; loading?: boolean; error?: ReactNode; name?: string; required?: boolean; disabled?: boolean; className?: string };

export default function RelationSelect({ label, options, value, defaultValue = [], onValueChange, multiple = true, loading, error, name, required, disabled, className }: RelationSelectProps) {
  const [open, setOpen] = useState(false);
  const [selected, update] = useControllableState({ value, defaultValue, onChange: onValueChange });
  const toggle = (id: string) => {
    update(multiple ? (selected.includes(id) ? selected.filter((item) => item !== id) : [...selected, id]) : [id]);
    if (!multiple) setOpen(false);
  };
  return <div className={className} data-vc-component="relation-select" data-vc-slot="root" data-vc-state={loading ? "loading" : error ? "error" : open ? "open" : "closed"}>
    <span data-vc-relation-label data-vc-slot="label">{label}{required && <span aria-hidden="true"> *</span>}</span>
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild><button type="button" role="combobox" aria-label={label} aria-expanded={open} aria-required={required || undefined} disabled={disabled} data-vc-slot="trigger">{selected.length ? `${selected.length} selected` : "Select relations"}</button></Popover.Trigger>
      <Popover.Portal><Popover.Content align="start" data-vc-relation-content data-vc-slot="content">
        <Command data-vc-slot="command">
          <Command.Input aria-label={`Search ${label}`} placeholder="Search relations" data-vc-slot="input" />
          <Command.List aria-multiselectable={multiple || undefined} data-vc-slot="list">
            {loading && <div role="status" data-vc-slot="loading">Loading relations</div>}
            {error && <div role="alert" data-vc-slot="error">{error}</div>}
            {!loading && !error && <Command.Empty data-vc-slot="empty">No relations found</Command.Empty>}
            {!loading && !error && options.map((option) => <Command.Item key={option.value} value={option.label} keywords={option.keywords} disabled={option.disabled} onSelect={() => toggle(option.value)} aria-selected={selected.includes(option.value)} data-vc-slot="option">
              <span data-vc-slot="option-label">{option.label}</span>{option.description && <small data-vc-slot="option-description">{option.description}</small>}{option.metadata}
            </Command.Item>)}
          </Command.List>
        </Command>
      </Popover.Content></Popover.Portal>
    </Popover.Root>
    {selected.length > 0 && <ul aria-label={`Selected ${label}`} data-vc-slot="selection">{selected.map((id) => {
      const option = options.find((item) => item.value === id);
      return <li key={id} data-vc-slot="selected-item">{option?.label ?? id}<button type="button" onClick={() => update(selected.filter((item) => item !== id))} data-vc-slot="remove">Remove {option?.label ?? id}</button></li>;
    })}</ul>}
    {name && selected.map((id) => <input key={id} type="hidden" name={name} value={id} data-vc-slot="hidden-input" />)}
  </div>;
}
