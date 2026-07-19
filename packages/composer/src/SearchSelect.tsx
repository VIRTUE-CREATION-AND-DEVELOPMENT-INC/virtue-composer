"use client";

import * as Popover from "@radix-ui/react-popover";
import { Command } from "cmdk";
import { useState } from "react";

export type SearchSelectOption = { value: string; label: string; description?: string; keywords?: string[]; disabled?: boolean };
export type SearchSelectProps = { label: string; options: SearchSelectOption[]; value?: string; defaultValue?: string; onValueChange?: (value: string) => void; placeholder?: string; searchPlaceholder?: string; emptyText?: string; disabled?: boolean; required?: boolean; name?: string; className?: string };

export default function SearchSelect({ label, options, value, defaultValue = "", onValueChange, placeholder = "Select an option", searchPlaceholder = "Search options", emptyText = "No options found", disabled, required, name, className }: SearchSelectProps) {
  const [open, setOpen] = useState(false);
  const [internalValue, setInternalValue] = useState(defaultValue);
  const selectedValue = value ?? internalValue;
  const selected = options.find((option) => option.value === selectedValue);
  const select = (nextValue: string) => {
    if (value === undefined) setInternalValue(nextValue);
    onValueChange?.(nextValue);
    setOpen(false);
  };

  return (
    <div className={className} data-vc-component="search-select">
      <span data-vc-search-select-label>{label}{required && <span aria-hidden="true"> *</span>}</span>
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <button type="button" role="combobox" aria-label={label} aria-expanded={open} aria-required={required || undefined} disabled={disabled} data-vc-search-select-trigger>{selected?.label ?? placeholder}</button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content align="start" sideOffset={6} data-vc-search-select-content>
            <Command data-vc-search-select-command>
              <Command.Input placeholder={searchPlaceholder} aria-label={searchPlaceholder} data-vc-search-select-input />
              <Command.List>
                <Command.Empty>{emptyText}</Command.Empty>
                {options.map((option) => <Command.Item key={option.value} value={option.label} keywords={option.keywords} disabled={option.disabled} aria-selected={option.value === selectedValue} onSelect={() => select(option.value)} data-vc-search-select-option>
                  <span>{option.label}</span>{option.description && <small>{option.description}</small>}
                </Command.Item>)}
              </Command.List>
            </Command>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
      {name && <input type="hidden" name={name} value={selectedValue} />}
    </div>
  );
}
