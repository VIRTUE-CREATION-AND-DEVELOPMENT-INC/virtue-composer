"use client";

import { format } from "date-fns";
import { useState } from "react";
import { DayPicker } from "react-day-picker";
import Button from "./Button";
import Popover from "./Popover";

export type DatePickerProps = { label: string; value?: Date; defaultValue?: Date; onValueChange?: (date: Date | undefined) => void; placeholder?: string; disabled?: boolean; required?: boolean; name?: string; min?: Date; max?: Date; className?: string };

export default function DatePicker({ label, value, defaultValue, onValueChange, placeholder = "Choose a date", disabled, required, name, min, max, className }: DatePickerProps) {
  const [internal, setInternal] = useState<Date | undefined>(defaultValue);
  const selected = value ?? internal;
  const select = (date: Date | undefined) => { if (value === undefined) setInternal(date); onValueChange?.(date); };
  return <div className={className} data-vc-component="date-picker"><span data-vc-date-label>{label}{required && <span aria-hidden="true"> *</span>}</span><Popover trigger={<Button disabled={disabled} aria-label={label}>{selected ? format(selected, "PPP") : placeholder}</Button>} align="start"><DayPicker mode="single" selected={selected} onSelect={select} disabled={[...(min ? [{ before: min }] : []), ...(max ? [{ after: max }] : [])]} /></Popover>{name && <input type="hidden" name={name} value={selected ? format(selected, "yyyy-MM-dd") : ""} />}</div>;
}
