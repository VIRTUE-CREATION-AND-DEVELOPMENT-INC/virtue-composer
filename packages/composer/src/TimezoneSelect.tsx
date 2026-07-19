"use client";

import { useMemo } from "react";
import SearchSelect from "./SearchSelect";

export type TimezoneOption = { value: string; label?: string };
export type TimezoneSelectProps = { label: string; value?: string; defaultValue?: string; onValueChange?: (value: string) => void; timezones?: TimezoneOption[]; referenceDate?: Date; name?: string; disabled?: boolean; required?: boolean; className?: string };

function offset(zone: string, date: Date) {
  try {
    const value = new Intl.DateTimeFormat("en", { timeZone: zone, timeZoneName: "shortOffset" }).formatToParts(date).find((part) => part.type === "timeZoneName")?.value;
    return value ?? "UTC";
  } catch { return "UTC"; }
}

export default function TimezoneSelect({ label, value, defaultValue, onValueChange, timezones, referenceDate = new Date(), name, disabled, required, className }: TimezoneSelectProps) {
  const options = useMemo(() => {
    const zones: TimezoneOption[] = timezones ?? Intl.supportedValuesOf("timeZone").map((value) => ({ value }));
    return zones.map((zone) => ({ value: zone.value, label: zone.label ?? zone.value.replaceAll("_", " "), description: offset(zone.value, referenceDate), keywords: [zone.value, offset(zone.value, referenceDate)] }));
  }, [timezones, referenceDate]);
  return <SearchSelect label={label} options={options} value={value} defaultValue={defaultValue} onValueChange={onValueChange} name={name} disabled={disabled} required={required} placeholder="Select timezone" searchPlaceholder="Search timezones" emptyText="No timezones found" className={className} />;
}
