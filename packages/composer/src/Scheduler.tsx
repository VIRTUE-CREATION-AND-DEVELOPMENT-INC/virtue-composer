"use client";

import { addMinutes, differenceInMinutes, format, isSameDay, setHours, startOfDay } from "date-fns";
import type { ReactNode } from "react";

export type SchedulerEvent = { id: string; title: ReactNode; start: Date; end: Date; description?: ReactNode; status?: string; disabled?: boolean };
export type SchedulerProps = { date: Date; events: SchedulerEvent[]; startHour?: number; endHour?: number; intervalMinutes?: number; pixelsPerMinute?: number; minimumEventHeight?: number; currentTime?: Date; onEventSelect?: (event: SchedulerEvent) => void; ariaLabel?: string; empty?: ReactNode; className?: string };

type PositionedEvent = { event: SchedulerEvent; offset: number; duration: number; lane: number; lanes: number };

function positionEvents(events: SchedulerEvent[], dayStart: Date, dayEnd: Date): PositionedEvent[] {
  const visible = events
    .filter((event) => event.start < dayEnd && event.end > dayStart)
    .sort((a, b) => a.start.getTime() - b.start.getTime());
  const groups: SchedulerEvent[][] = [];
  let group: SchedulerEvent[] = [];
  let groupEnd = 0;
  for (const event of visible) {
    if (group.length > 0 && event.start.getTime() >= groupEnd) {
      groups.push(group);
      group = [];
      groupEnd = 0;
    }
    group.push(event);
    groupEnd = Math.max(groupEnd, event.end.getTime());
  }
  if (group.length > 0) groups.push(group);

  return groups.flatMap((overlapGroup) => {
    const laneEnds: number[] = [];
    const assigned = overlapGroup.map((event) => {
      const start = Math.max(event.start.getTime(), dayStart.getTime());
      const end = Math.min(event.end.getTime(), dayEnd.getTime());
      let lane = laneEnds.findIndex((laneEnd) => laneEnd <= start);
      if (lane === -1) lane = laneEnds.length;
      laneEnds[lane] = end;
      return { event, lane, offset: differenceInMinutes(start, dayStart), duration: Math.max(1, differenceInMinutes(end, start)) };
    });
    return assigned.map((item) => ({ ...item, lanes: laneEnds.length }));
  });
}

export default function Scheduler({ date, events, startHour = 8, endHour = 18, intervalMinutes = 60, pixelsPerMinute = 1, minimumEventHeight = 30, currentTime, onEventSelect, ariaLabel, empty, className }: SchedulerProps) {
  const dayStart = setHours(startOfDay(date), startHour);
  const dayEnd = setHours(startOfDay(date), endHour);
  const slotCount = Math.max(0, Math.ceil(((endHour - startHour) * 60) / intervalMinutes));
  const slots = Array.from({ length: slotCount }, (_, index) => addMinutes(dayStart, index * intervalMinutes));
  const positionedEvents = positionEvents(events, dayStart, dayEnd);
  const currentOffset = currentTime && isSameDay(currentTime, date) && currentTime >= dayStart && currentTime <= dayEnd ? differenceInMinutes(currentTime, dayStart) : undefined;
  const rootStyle = { "--vc-scheduler-scale": pixelsPerMinute, "--vc-scheduler-slot-minutes": intervalMinutes } as React.CSSProperties;

  return <section aria-label={ariaLabel ?? `Schedule for ${format(date, "PPP")}`} className={className} style={rootStyle} data-vc-component="scheduler" data-vc-slot="root" data-vc-state={positionedEvents.length > 0 ? "populated" : "empty"}>
    <header data-vc-scheduler-header data-vc-slot="header"><time dateTime={format(date, "yyyy-MM-dd")} data-vc-slot="date">{format(date, "EEEE, MMMM d")}</time></header>
    <div data-vc-scheduler-grid data-vc-slot="grid">
      {slots.map((slot) => <div key={slot.toISOString()} data-vc-scheduler-slot data-vc-slot="time-slot"><time dateTime={slot.toISOString()} data-vc-slot="time-label">{format(slot, "p")}</time></div>)}
      <div data-vc-scheduler-events data-vc-slot="events">
        {positionedEvents.length === 0 ? <div data-vc-scheduler-empty data-vc-slot="empty">{empty}</div> : positionedEvents.map(({ event, offset, duration, lane, lanes }) => {
          const compact = duration * pixelsPerMinute < 52;
          const eventStyle = { "--vc-scheduler-offset": offset, "--vc-scheduler-duration": duration, "--vc-scheduler-min-height": minimumEventHeight, "--vc-scheduler-lane-left": `${(lane / lanes) * 100}%`, "--vc-scheduler-lane-width": `${100 / lanes}%` } as React.CSSProperties;
          return <button key={event.id} type="button" disabled={event.disabled} onClick={() => onEventSelect?.(event)} style={eventStyle} data-vc-scheduler-event data-vc-slot="event" data-vc-status={event.status} data-vc-compact={compact || undefined}>
            <strong data-vc-slot="event-title">{event.title}</strong>
            <span data-vc-slot="event-time">{format(event.start, "p")} – {format(event.end, "p")}</span>
            {event.description && <small data-vc-slot="event-description">{event.description}</small>}
          </button>;
        })}
        {currentOffset !== undefined && <div aria-hidden="true" style={{ "--vc-scheduler-offset": currentOffset } as React.CSSProperties} data-vc-scheduler-now data-vc-slot="current-time" />}
      </div>
    </div>
  </section>;
}
