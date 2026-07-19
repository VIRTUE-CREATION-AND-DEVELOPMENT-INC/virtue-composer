"use client";

import { DayPicker, type DayPickerProps } from "react-day-picker";

export type CalendarProps = DayPickerProps & { containerClassName?: string; ariaLabel?: string };

export default function Calendar({ containerClassName, ariaLabel = "Calendar", ...props }: CalendarProps) {
  return <div aria-label={ariaLabel} className={containerClassName} data-vc-component="calendar"><DayPicker {...props} /></div>;
}
