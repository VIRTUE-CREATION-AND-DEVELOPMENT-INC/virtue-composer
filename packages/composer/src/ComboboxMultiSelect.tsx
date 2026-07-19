"use client";

import * as Popover from "@radix-ui/react-popover";
import { Command } from "cmdk";
import { useState } from "react";

export type ComboboxMultiSelectOption = { value: string; label: string; description?: string; keywords?: string[]; disabled?: boolean; group?: string };
export type ComboboxMultiSelectProps = { label: string; options: ComboboxMultiSelectOption[]; value?: string[]; defaultValue?: string[]; onValueChange?: (values: string[]) => void; placeholder?: string; searchPlaceholder?: string; emptyText?: string; name?: string; disabled?: boolean; required?: boolean; className?: string };

export default function ComboboxMultiSelect({ label, options, value, defaultValue = [], onValueChange, placeholder = "Select options", searchPlaceholder = "Search options", emptyText = "No options found", name, disabled, required, className }: ComboboxMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [internal, setInternal] = useState(defaultValue);
  const selected = value ?? internal;
  const update = (next: string[]) => { if (value === undefined) setInternal(next); onValueChange?.(next); };
  const toggle = (id: string) => update(selected.includes(id) ? selected.filter((item) => item !== id) : [...selected, id]);
  return <div className={className} data-vc-component="combobox-multi-select">
    <span>{label}{required && <span aria-hidden="true"> *</span>}</span>
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild><button type="button" role="combobox" aria-label={label} aria-expanded={open} aria-required={required || undefined} disabled={disabled}>{selected.length ? `${selected.length} selected` : placeholder}</button></Popover.Trigger>
      <Popover.Portal><Popover.Content align="start" data-vc-multi-content><Command>
        <Command.Input aria-label={searchPlaceholder} placeholder={searchPlaceholder} />
        <Command.List aria-multiselectable="true"><Command.Empty>{emptyText}</Command.Empty>{options.map((option) => <Command.Item key={option.value} value={option.label} keywords={option.keywords} disabled={option.disabled} onSelect={() => toggle(option.value)} aria-selected={selected.includes(option.value)}>{option.label}{option.description && <small>{option.description}</small>}</Command.Item>)}</Command.List>
      </Command></Popover.Content></Popover.Portal>
    </Popover.Root>
    {selected.length > 0 && <ul aria-label={`Selected ${label}`}>{selected.map((id) => { const option = options.find((item) => item.value === id); return <li key={id}>{option?.label ?? id}<button type="button" onClick={() => toggle(id)}>Remove {option?.label ?? id}</button></li>; })}</ul>}
    {name && selected.map((id) => <input key={id} type="hidden" name={name} value={id} />)}
  </div>;
}
