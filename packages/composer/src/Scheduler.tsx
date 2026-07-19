"use client";

import { addMinutes, differenceInMinutes, format, isSameDay, setHours, startOfDay } from "date-fns";
import type { ReactNode } from "react";

export type SchedulerEvent = { id: string; title: ReactNode; start: Date; end: Date; description?: ReactNode; status?: string; disabled?: boolean };
export type SchedulerProps = { date: Date; events: SchedulerEvent[]; startHour?: number; endHour?: number; intervalMinutes?: number; onEventSelect?: (event: SchedulerEvent) => void; ariaLabel?: string; empty?: ReactNode; className?: string };

export default function Scheduler({ date, events, startHour = 8, endHour = 18, intervalMinutes = 60, onEventSelect, ariaLabel, empty, className }: SchedulerProps) {
  const dayStart = setHours(startOfDay(date), startHour);
  const slots = Array.from({ length: Math.max(0, Math.ceil(((endHour - startHour) * 60) / intervalMinutes)) }, (_, index) => addMinutes(dayStart, index * intervalMinutes));
  const dayEvents = events.filter((event) => isSameDay(event.start, date)).sort((a, b) => a.start.getTime() - b.start.getTime());
  return <section aria-label={ariaLabel ?? `Schedule for ${format(date, "PPP")}`} className={className} data-vc-component="scheduler"><header data-vc-scheduler-header><time dateTime={format(date, "yyyy-MM-dd")}>{format(date, "EEEE, MMMM d")}</time></header><div data-vc-scheduler-grid>{slots.map((slot) => <div key={slot.toISOString()} data-vc-scheduler-slot><time dateTime={slot.toISOString()}>{format(slot, "p")}</time></div>)}<div data-vc-scheduler-events>{dayEvents.length === 0 ? <div data-vc-scheduler-empty>{empty}</div> : dayEvents.map((event) => { const offset = differenceInMinutes(event.start, dayStart); const duration = Math.max(intervalMinutes / 2, differenceInMinutes(event.end, event.start)); return <button key={event.id} type="button" disabled={event.disabled} onClick={() => onEventSelect?.(event)} style={{ "--vc-scheduler-offset": offset, "--vc-scheduler-duration": duration } as React.CSSProperties} data-vc-scheduler-event data-vc-status={event.status}><strong>{event.title}</strong><span>{format(event.start, "p")} – {format(event.end, "p")}</span>{event.description && <small>{event.description}</small>}</button>; })}</div></div></section>;
}
