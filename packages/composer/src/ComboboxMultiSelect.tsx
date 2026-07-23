"use client";

import * as Popover from "@radix-ui/react-popover";
import { Command } from "cmdk";
import useControllableState from "./useControllableState";

export type ComboboxMultiSelectOption = { value: string; label: string; description?: string; keywords?: string[]; disabled?: boolean; group?: string };
export type ComboboxMultiSelectProps = { label: string; options: ComboboxMultiSelectOption[]; value?: string[]; defaultValue?: string[]; onValueChange?: (values: string[]) => void; open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void; side?: "top" | "right" | "bottom" | "left"; align?: "start" | "center" | "end"; sideOffset?: number; collisionPadding?: number; placeholder?: string; searchPlaceholder?: string; emptyText?: string; name?: string; disabled?: boolean; required?: boolean; className?: string };

export default function ComboboxMultiSelect({ label, options, value, defaultValue = [], onValueChange, open, defaultOpen = false, onOpenChange, side = "bottom", align = "start", sideOffset = 6, collisionPadding = 8, placeholder = "Select options", searchPlaceholder = "Search options", emptyText = "No options found", name, disabled, required, className }: ComboboxMultiSelectProps) {
  const [isOpen, setOpen] = useControllableState({ value: open, defaultValue: defaultOpen, onChange: onOpenChange });
  const [selected, update] = useControllableState({ value, defaultValue, onChange: onValueChange });
  const toggle = (id: string) => update(selected.includes(id) ? selected.filter((item) => item !== id) : [...selected, id]);
  return <div className={className} data-vc-component="combobox-multi-select" data-vc-slot="root" data-vc-state={isOpen ? "open" : "closed"}>
    <span data-vc-slot="label">{label}{required && <span aria-hidden="true"> *</span>}</span>
    <Popover.Root open={isOpen} onOpenChange={setOpen}>
      <Popover.Trigger asChild><button type="button" role="combobox" aria-label={label} aria-expanded={isOpen} aria-required={required || undefined} disabled={disabled} data-vc-slot="trigger">{selected.length ? `${selected.length} selected` : placeholder}</button></Popover.Trigger>
      <Popover.Portal><Popover.Content align={align} side={side} sideOffset={sideOffset} collisionPadding={collisionPadding} data-vc-multi-content data-vc-slot="content"><Command data-vc-slot="command">
        <Command.Input aria-label={searchPlaceholder} placeholder={searchPlaceholder} data-vc-slot="input" />
        <Command.List aria-multiselectable="true" data-vc-slot="list"><Command.Empty data-vc-slot="empty">{emptyText}</Command.Empty>{options.map((option) => <Command.Item key={option.value} value={option.label} keywords={option.keywords} disabled={option.disabled} onSelect={() => toggle(option.value)} aria-selected={selected.includes(option.value)} data-vc-slot="option"><span data-vc-slot="option-label">{option.label}</span>{option.description && <small data-vc-slot="option-description">{option.description}</small>}</Command.Item>)}</Command.List>
      </Command></Popover.Content></Popover.Portal>
    </Popover.Root>
    {selected.length > 0 && <ul aria-label={`Selected ${label}`} data-vc-slot="selection">{selected.map((id) => { const option = options.find((item) => item.value === id); return <li key={id} data-vc-slot="selected-item">{option?.label ?? id}<button type="button" onClick={() => toggle(id)} data-vc-slot="remove">Remove {option?.label ?? id}</button></li>; })}</ul>}
    {name && selected.map((id) => <input key={id} type="hidden" name={name} value={id} data-vc-slot="hidden-input" />)}
  </div>;
}
