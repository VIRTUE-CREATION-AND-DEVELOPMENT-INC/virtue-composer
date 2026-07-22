"use client";

import { format } from "date-fns";
import { useState } from "react";
import DatePicker from "./DatePicker";
import TimeInput from "./TimeInput";

export type DateTimePickerProps = { label: string; value?: Date; defaultValue?: Date; onValueChange?: (value: Date | undefined) => void; timezone?: string; min?: Date; max?: Date; name?: string; required?: boolean; disabled?: boolean; className?: string };

export default function DateTimePicker({ label, value, defaultValue, onValueChange, timezone, min, max, name, required, disabled, className }: DateTimePickerProps) {
  const [internal, setInternal] = useState<Date | undefined>(defaultValue);
  const selected = value ?? internal;
  const commit = (next: Date | undefined) => { if (value === undefined) setInternal(next); onValueChange?.(next); };
  const setDate = (date: Date | undefined) => {
    if (!date) return commit(undefined);
    const next = new Date(date);
    if (selected) next.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
    commit(next);
  };
  const setTime = (time: string) => {
    if (!/^\d{2}:\d{2}$/.test(time)) return;
    const [hours, minutes] = time.split(":").map(Number);
    const next = selected ? new Date(selected) : new Date();
    next.setHours(hours, minutes, 0, 0);
    commit(next);
  };
  return <fieldset className={className} data-vc-component="date-time-picker" data-vc-slot="root">
    <legend>{label}{required && <span aria-hidden="true"> *</span>}</legend>
    {timezone && <p data-vc-timezone>Timezone: {timezone}</p>}
    <div data-vc-date-time-controls>
      <DatePicker label={`${label} date`} value={selected} onValueChange={setDate} min={min} max={max} disabled={disabled} required={required} />
      <TimeInput label={`${label} time`} value={selected ? format(selected, "HH:mm") : ""} onChange={(event) => setTime(event.currentTarget.value)} disabled={disabled} required={required} />
    </div>
    {name && <input type="hidden" name={name} value={selected?.toISOString() ?? ""} />}
  </fieldset>;
}
