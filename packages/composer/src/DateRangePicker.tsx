"use client";

import { format } from "date-fns";
import type { Locale } from "date-fns";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import Button from "./Button";
import Calendar from "./Calendar";
import Dialog from "./Dialog";
import useControllableState from "./useControllableState";

export type DateRangePickerProps = { label: string; value?: DateRange; defaultValue?: DateRange; onValueChange?: (range: DateRange | undefined) => void; commitMode?: "immediate" | "explicit"; applyLabel?: string; cancelLabel?: string; placeholder?: string; disabled?: boolean; required?: boolean; startName?: string; endName?: string; min?: Date; max?: Date; today?: Date; numberOfMonths?: number; locale?: Locale; weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6; dir?: "ltr" | "rtl"; className?: string };

export default function DateRangePicker({ label, value, defaultValue, onValueChange, commitMode = "immediate", applyLabel = "Apply dates", cancelLabel = "Cancel", placeholder = "Choose dates", disabled, required, startName, endName, min, max, today, numberOfMonths = 2, locale, weekStartsOn, dir, className }: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useControllableState<DateRange | undefined>({ value, defaultValue, onChange: onValueChange });
  const [draft, setDraft] = useState<DateRange | undefined>(selected);
  const formatDate = (date: Date, token: string) => format(date, token, { locale });
  const displayed = commitMode === "explicit" && open ? draft : selected;
  const openChange = (nextOpen: boolean) => { if (nextOpen) setDraft(selected); setOpen(nextOpen); };
  const select = (range: DateRange | undefined) => {
    if (commitMode === "explicit") { setDraft(range); return; }
    setSelected(range); if (range?.from && range.to) setOpen(false);
  };
  const display = selected?.from ? selected.to ? `${formatDate(selected.from, "PP")} – ${formatDate(selected.to, "PP")}` : formatDate(selected.from, "PP") : placeholder;
  return <div className={className} data-vc-component="date-range-picker" data-vc-slot="root" data-vc-state={open ? "open" : selected?.from && selected.to ? "complete" : selected?.from ? "start-selected" : "empty"}>
    <span data-vc-date-label data-vc-slot="label">{label}{required && <span aria-hidden="true"> *</span>}</span>
    <Dialog open={open} onOpenChange={openChange} trigger={<Button disabled={disabled} aria-label={label} data-vc-slot="trigger">{display}</Button>} title={label} className="vc-date-range-picker-dialog">
      <Calendar mode="range" selected={displayed} onSelect={select} resetOnSelect disabled={[...(min ? [{ before: min }] : []), ...(max ? [{ after: max }] : [])]} today={today} numberOfMonths={numberOfMonths} locale={locale} weekStartsOn={weekStartsOn} dir={dir} ariaLabel={`${label} calendar`} />
      <p role="status" aria-live="polite" data-vc-slot="selection-status">{displayed?.from ? displayed.to ? `Range selected from ${formatDate(displayed.from, "PPP")} through ${formatDate(displayed.to, "PPP")}.` : `Start date ${formatDate(displayed.from, "PPP")} selected. Choose an end date.` : "No date range selected."}</p>
      {commitMode === "explicit" && <div data-vc-slot="picker-actions"><Button onClick={() => { setDraft(selected); setOpen(false); }}>{cancelLabel}</Button><Button onClick={() => { setSelected(draft); setOpen(false); }} disabled={!draft?.from || !draft.to}>{applyLabel}</Button></div>}
    </Dialog>
    {startName && <input type="hidden" name={startName} value={selected?.from ? formatDate(selected.from, "yyyy-MM-dd") : ""} data-vc-slot="start-input" />}
    {endName && <input type="hidden" name={endName} value={selected?.to ? formatDate(selected.to, "yyyy-MM-dd") : ""} data-vc-slot="end-input" />}
  </div>;
}
