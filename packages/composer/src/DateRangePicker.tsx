"use client";

import { format } from "date-fns";
import { useState } from "react";
import { DayPicker, type DateRange } from "react-day-picker";
import Button from "./Button";
import Popover from "./Popover";

export type DateRangePickerProps = { label: string; value?: DateRange; defaultValue?: DateRange; onValueChange?: (range: DateRange | undefined) => void; placeholder?: string; disabled?: boolean; required?: boolean; startName?: string; endName?: string; numberOfMonths?: number; className?: string };

export default function DateRangePicker({ label, value, defaultValue, onValueChange, placeholder = "Choose dates", disabled, required, startName, endName, numberOfMonths = 2, className }: DateRangePickerProps) {
  const [internal, setInternal] = useState<DateRange | undefined>(defaultValue);
  const selected = value ?? internal;
  const select = (range: DateRange | undefined) => { if (value === undefined) setInternal(range); onValueChange?.(range); };
  const display = selected?.from ? selected.to ? `${format(selected.from, "PP")} – ${format(selected.to, "PP")}` : format(selected.from, "PP") : placeholder;
  return <div className={className} data-vc-component="date-range-picker"><span data-vc-date-label>{label}{required && <span aria-hidden="true"> *</span>}</span><Popover trigger={<Button disabled={disabled} aria-label={label}>{display}</Button>} align="start"><DayPicker mode="range" selected={selected} onSelect={select} numberOfMonths={numberOfMonths} /></Popover>{startName && <input type="hidden" name={startName} value={selected?.from ? format(selected.from, "yyyy-MM-dd") : ""} />}{endName && <input type="hidden" name={endName} value={selected?.to ? format(selected.to, "yyyy-MM-dd") : ""} />}</div>;
}
