"use client";

import { format } from "date-fns";
import type { Locale } from "date-fns";
import { useState } from "react";
import Button from "./Button";
import Calendar from "./Calendar";
import Dialog from "./Dialog";
import useControllableState from "./useControllableState";

export type DatePickerProps = { label: string; value?: Date; defaultValue?: Date; onValueChange?: (date: Date | undefined) => void; commitMode?: "immediate" | "explicit"; applyLabel?: string; cancelLabel?: string; placeholder?: string; disabled?: boolean; required?: boolean; name?: string; min?: Date; max?: Date; locale?: Locale; weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6; dir?: "ltr" | "rtl"; className?: string };

export default function DatePicker({ label, value, defaultValue, onValueChange, commitMode = "immediate", applyLabel = "Apply date", cancelLabel = "Cancel", placeholder = "Choose a date", disabled, required, name, min, max, locale, weekStartsOn, dir, className }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useControllableState<Date | undefined>({ value, defaultValue, onChange: onValueChange });
  const [draft, setDraft] = useState<Date | undefined>(selected);
  const formatDate = (date: Date, token: string) => format(date, token, { locale });
  const displayed = commitMode === "explicit" && open ? draft : selected;
  const openChange = (nextOpen: boolean) => { if (nextOpen) setDraft(selected); setOpen(nextOpen); };
  const select = (date: Date | undefined) => {
    if (commitMode === "explicit") { setDraft(date); return; }
    setSelected(date); if (date) setOpen(false);
  };
  return <div className={className} data-vc-component="date-picker" data-vc-slot="root" data-vc-state={open ? "open" : selected ? "selected" : "empty"}>
    <span data-vc-date-label data-vc-slot="label">{label}{required && <span aria-hidden="true"> *</span>}</span>
    <Dialog open={open} onOpenChange={openChange} trigger={<Button disabled={disabled} aria-label={label} data-vc-slot="trigger">{selected ? formatDate(selected, "PPP") : placeholder}</Button>} title={label} className="vc-date-picker-dialog">
      <Calendar mode="single" selected={displayed} onSelect={select} disabled={[...(min ? [{ before: min }] : []), ...(max ? [{ after: max }] : [])]} locale={locale} weekStartsOn={weekStartsOn} dir={dir} ariaLabel={`${label} calendar`} />
      <p role="status" aria-live="polite" data-vc-slot="selection-status">{displayed ? `${formatDate(displayed, "PPP")} selected.` : "No date selected."}</p>
      {commitMode === "explicit" && <div data-vc-slot="picker-actions"><Button onClick={() => { setDraft(selected); setOpen(false); }}>{cancelLabel}</Button><Button onClick={() => { setSelected(draft); setOpen(false); }} disabled={!draft}>{applyLabel}</Button></div>}
    </Dialog>
    {name && <input type="hidden" name={name} value={selected ? formatDate(selected, "yyyy-MM-dd") : ""} data-vc-slot="hidden-input" />}
  </div>;
}
