"use client";

import { format } from "date-fns";
import { useState } from "react";
import Button from "./Button";
import Calendar from "./Calendar";
import Dialog from "./Dialog";
import useControllableState from "./useControllableState";

export type DatePickerProps = { label: string; value?: Date; defaultValue?: Date; onValueChange?: (date: Date | undefined) => void; placeholder?: string; disabled?: boolean; required?: boolean; name?: string; min?: Date; max?: Date; className?: string };

export default function DatePicker({ label, value, defaultValue, onValueChange, placeholder = "Choose a date", disabled, required, name, min, max, className }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useControllableState<Date | undefined>({ value, defaultValue, onChange: onValueChange });
  const select = (date: Date | undefined) => {
    setSelected(date);
    if (date) setOpen(false);
  };
  return <div className={className} data-vc-component="date-picker" data-vc-slot="root" data-vc-state={open ? "open" : selected ? "selected" : "empty"}>
    <span data-vc-date-label data-vc-slot="label">{label}{required && <span aria-hidden="true"> *</span>}</span>
    <Dialog open={open} onOpenChange={setOpen} trigger={<Button disabled={disabled} aria-label={label} data-vc-slot="trigger">{selected ? format(selected, "PPP") : placeholder}</Button>} title={label} className="vc-date-picker-dialog">
      <Calendar mode="single" selected={selected} onSelect={select} disabled={[...(min ? [{ before: min }] : []), ...(max ? [{ after: max }] : [])]} ariaLabel={`${label} calendar`} />
    </Dialog>
    {name && <input type="hidden" name={name} value={selected ? format(selected, "yyyy-MM-dd") : ""} data-vc-slot="hidden-input" />}
  </div>;
}
