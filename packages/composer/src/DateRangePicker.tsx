"use client";

import { format } from "date-fns";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import Button from "./Button";
import Calendar from "./Calendar";
import Dialog from "./Dialog";
import useControllableState from "./useControllableState";

export type DateRangePickerProps = { label: string; value?: DateRange; defaultValue?: DateRange; onValueChange?: (range: DateRange | undefined) => void; placeholder?: string; disabled?: boolean; required?: boolean; startName?: string; endName?: string; numberOfMonths?: number; className?: string };

export default function DateRangePicker({ label, value, defaultValue, onValueChange, placeholder = "Choose dates", disabled, required, startName, endName, numberOfMonths = 2, className }: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useControllableState<DateRange | undefined>({ value, defaultValue, onChange: onValueChange });
  const select = (range: DateRange | undefined) => {
    setSelected(range);
    if (range?.from && range.to) setOpen(false);
  };
  const display = selected?.from ? selected.to ? `${format(selected.from, "PP")} – ${format(selected.to, "PP")}` : format(selected.from, "PP") : placeholder;
  return <div className={className} data-vc-component="date-range-picker" data-vc-slot="root" data-vc-state={open ? "open" : selected?.from && selected.to ? "complete" : selected?.from ? "start-selected" : "empty"}>
    <span data-vc-date-label data-vc-slot="label">{label}{required && <span aria-hidden="true"> *</span>}</span>
    <Dialog open={open} onOpenChange={setOpen} trigger={<Button disabled={disabled} aria-label={label} data-vc-slot="trigger">{display}</Button>} title={label} className="vc-date-range-picker-dialog">
      <Calendar mode="range" selected={selected} onSelect={select} resetOnSelect numberOfMonths={numberOfMonths} ariaLabel={`${label} calendar`} />
    </Dialog>
    {startName && <input type="hidden" name={startName} value={selected?.from ? format(selected.from, "yyyy-MM-dd") : ""} data-vc-slot="start-input" />}
    {endName && <input type="hidden" name={endName} value={selected?.to ? format(selected.to, "yyyy-MM-dd") : ""} data-vc-slot="end-input" />}
  </div>;
}
