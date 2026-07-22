"use client";

import { Animation, DayFlag, DayPicker, getDefaultClassNames, SelectionState, UI, type ClassNames, type DayPickerProps } from "react-day-picker";

export type CalendarProps = DayPickerProps & { containerClassName?: string; ariaLabel?: string };

const composerClassNames: Partial<ClassNames> = {
  [UI.Root]: "vc-calendar-picker",
  [UI.Months]: "vc-calendar-months",
  [UI.Month]: "vc-calendar-month",
  [UI.Nav]: "vc-calendar-nav",
  [UI.PreviousMonthButton]: "vc-calendar-previous",
  [UI.NextMonthButton]: "vc-calendar-next",
  [UI.MonthCaption]: "vc-calendar-caption",
  [UI.CaptionLabel]: "vc-calendar-caption-label",
  [UI.MonthGrid]: "vc-calendar-grid",
  [UI.Weekdays]: "vc-calendar-weekdays",
  [UI.Weekday]: "vc-calendar-weekday",
  [UI.Weeks]: "vc-calendar-weeks",
  [UI.Week]: "vc-calendar-week",
  [UI.Day]: "vc-calendar-day",
  [UI.DayButton]: "vc-calendar-day-button",
  [UI.Footer]: "vc-calendar-footer",
  [DayFlag.today]: "vc-calendar-today",
  [DayFlag.outside]: "vc-calendar-outside",
  [DayFlag.disabled]: "vc-calendar-disabled",
  [DayFlag.focused]: "vc-calendar-focused",
  [DayFlag.hidden]: "vc-calendar-hidden",
  [SelectionState.selected]: "vc-calendar-selected",
  [SelectionState.range_start]: "vc-calendar-range-start",
  [SelectionState.range_middle]: "vc-calendar-range-middle",
  [SelectionState.range_end]: "vc-calendar-range-end",
};

function getComposerClassNames(overrides?: Partial<ClassNames>): ClassNames {
  const defaults = getDefaultClassNames();
  return Object.fromEntries(Object.entries(defaults).map(([key, defaultClassName]) => [
    key,
    [defaultClassName, composerClassNames[key as UI | DayFlag | SelectionState | Animation], overrides?.[key as UI | DayFlag | SelectionState | Animation]].filter(Boolean).join(" "),
  ])) as ClassNames;
}

export default function Calendar({ containerClassName, ariaLabel = "Calendar", ...props }: CalendarProps) {
  const pickerProps = { ...props, classNames: getComposerClassNames(props.classNames) } as DayPickerProps;
  return <div aria-label={ariaLabel} className={containerClassName} data-vc-component="calendar" data-vc-slot="root" data-vc-mode={props.mode ?? "single"} data-vc-months={props.numberOfMonths ?? 1}>
    <DayPicker {...pickerProps} />
  </div>;
}
