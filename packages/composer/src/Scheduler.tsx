"use client";

import { addDays, addMinutes, differenceInMinutes, format, isSameDay, setHours, startOfDay, startOfWeek } from "date-fns";
import type { DragEvent, KeyboardEvent, PointerEvent, ReactNode } from "react";

export type SchedulerEvent = { id: string; title: ReactNode; start: Date; end: Date; description?: ReactNode; status?: string; disabled?: boolean };
export type SchedulerEventChange = { start: Date; end: Date; reason: "move" | "resize" };
export type SchedulerProps = { date: Date; events: SchedulerEvent[]; view?: "day" | "week"; weekStartsOn?: 0 | 1; startHour?: number; endHour?: number; intervalMinutes?: number; interactionStepMinutes?: number; pixelsPerMinute?: number; minimumEventHeight?: number; currentTime?: Date; onEventSelect?: (event: SchedulerEvent) => void; onEventChange?: (event: SchedulerEvent, change: SchedulerEventChange) => void; ariaLabel?: string; empty?: ReactNode; className?: string };

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

type DayProps = Omit<SchedulerProps, "date" | "view" | "weekStartsOn" | "className" | "ariaLabel"> & { date: Date };

function SchedulerDay({ date, events, startHour = 8, endHour = 18, intervalMinutes = 60, interactionStepMinutes = 15, pixelsPerMinute = 1, minimumEventHeight = 30, currentTime, onEventSelect, onEventChange, empty }: DayProps) {
  const dayStart = setHours(startOfDay(date), startHour); const dayEnd = setHours(startOfDay(date), endHour);
  const slotCount = Math.max(0, Math.ceil(((endHour - startHour) * 60) / intervalMinutes));
  const slots = Array.from({ length: slotCount }, (_, index) => addMinutes(dayStart, index * intervalMinutes));
  const positionedEvents = positionEvents(events, dayStart, dayEnd);
  const currentOffset = currentTime && isSameDay(currentTime, date) && currentTime >= dayStart && currentTime <= dayEnd ? differenceInMinutes(currentTime, dayStart) : undefined;
  const eventById = (id: string) => events.find((event) => event.id === id);
  const moveTo = (event: SchedulerEvent, start: Date) => onEventChange?.(event, { start, end: addMinutes(start, differenceInMinutes(event.end, event.start)), reason: "move" });
  const drop = (slot: Date, dragEvent: DragEvent<HTMLDivElement>) => { dragEvent.preventDefault(); const event = eventById(dragEvent.dataTransfer.getData("text/vc-scheduler-event")); if (event && !event.disabled) moveTo(event, slot); };
  const keyboardChange = (event: SchedulerEvent, keyboardEvent: KeyboardEvent<HTMLButtonElement>) => {
    if (!keyboardEvent.altKey || (keyboardEvent.key !== "ArrowUp" && keyboardEvent.key !== "ArrowDown")) return; keyboardEvent.preventDefault(); const delta = keyboardEvent.key === "ArrowDown" ? interactionStepMinutes : -interactionStepMinutes;
    if (keyboardEvent.shiftKey) { const end = addMinutes(event.end, delta); if (end > event.start) onEventChange?.(event, { start: event.start, end, reason: "resize" }); } else moveTo(event, addMinutes(event.start, delta));
  };
  const pointerResizeStart = (event: SchedulerEvent, pointerEvent: PointerEvent<HTMLButtonElement>) => { const bounds = pointerEvent.currentTarget.getBoundingClientRect(); if (!onEventChange || event.disabled || pointerEvent.clientY < bounds.bottom - 10) return; pointerEvent.preventDefault(); pointerEvent.currentTarget.setPointerCapture(pointerEvent.pointerId); pointerEvent.currentTarget.dataset.resizeStartY = String(pointerEvent.clientY); pointerEvent.currentTarget.dataset.resizeEnd = String(event.end.getTime()); };
  const pointerResizeMove = (event: SchedulerEvent, pointerEvent: PointerEvent<HTMLButtonElement>) => { const startY = Number(pointerEvent.currentTarget.dataset.resizeStartY); const initialEnd = Number(pointerEvent.currentTarget.dataset.resizeEnd); if (!pointerEvent.currentTarget.hasPointerCapture(pointerEvent.pointerId) || !Number.isFinite(startY) || !Number.isFinite(initialEnd)) return; const rawDelta = (pointerEvent.clientY - startY) / pixelsPerMinute; const delta = Math.round(rawDelta / interactionStepMinutes) * interactionStepMinutes; if (Math.abs(rawDelta) > 2) pointerEvent.currentTarget.dataset.vcResized = "true"; const end = addMinutes(new Date(initialEnd), delta); if (end > event.start) onEventChange?.(event, { start: event.start, end, reason: "resize" }); };
  const pointerResizeEnd = (pointerEvent: PointerEvent<HTMLButtonElement>) => { delete pointerEvent.currentTarget.dataset.resizeStartY; delete pointerEvent.currentTarget.dataset.resizeEnd; if (pointerEvent.currentTarget.hasPointerCapture(pointerEvent.pointerId)) pointerEvent.currentTarget.releasePointerCapture(pointerEvent.pointerId); };
  return <div aria-label={`Schedule for ${format(date, "PPP")}`} data-vc-scheduler-day data-vc-slot="day" data-vc-state={positionedEvents.length > 0 ? "populated" : "empty"}>
    <header data-vc-scheduler-header data-vc-slot="day-header"><time dateTime={format(date, "yyyy-MM-dd")} data-vc-slot="date">{format(date, "EEEE, MMMM d")}</time></header>
    <div data-vc-scheduler-grid data-vc-slot="grid">
      {slots.map((slot) => <div key={slot.toISOString()} onDragOver={(event) => event.preventDefault()} onDrop={(event) => drop(slot, event)} data-vc-scheduler-slot data-vc-slot="time-slot"><time dateTime={slot.toISOString()} data-vc-slot="time-label">{format(slot, "p")}</time></div>)}
      <div data-vc-scheduler-events data-vc-slot="events">
        {positionedEvents.length === 0 ? <div data-vc-scheduler-empty data-vc-slot="empty">{empty}</div> : positionedEvents.map(({ event, offset, duration, lane, lanes }) => {
          const compact = duration * pixelsPerMinute < 52;
          const eventStyle = { "--vc-scheduler-offset": offset, "--vc-scheduler-duration": duration, "--vc-scheduler-min-height": minimumEventHeight, "--vc-scheduler-lane-left": `${(lane / lanes) * 100}%`, "--vc-scheduler-lane-width": `${100 / lanes}%` } as React.CSSProperties;
          return <button key={event.id} type="button" disabled={event.disabled} draggable={!event.disabled && Boolean(onEventChange)} onDragStart={(dragEvent) => dragEvent.dataTransfer.setData("text/vc-scheduler-event", event.id)} onKeyDown={(keyboardEvent) => keyboardChange(event, keyboardEvent)} onPointerDown={(pointerEvent) => pointerResizeStart(event, pointerEvent)} onPointerMove={(pointerEvent) => pointerResizeMove(event, pointerEvent)} onPointerUp={pointerResizeEnd} onPointerCancel={pointerResizeEnd} onClick={(clickEvent) => { if (clickEvent.currentTarget.dataset.vcResized) { delete clickEvent.currentTarget.dataset.vcResized; return; } onEventSelect?.(event); }} style={eventStyle} aria-description={onEventChange ? "Drag to a time slot. Drag the bottom edge or use Shift, Alt plus arrow to resize; Alt plus arrow moves." : undefined} data-vc-scheduler-event data-vc-slot="event" data-vc-status={event.status} data-vc-compact={compact || undefined}>
            <strong data-vc-slot="event-title">{event.title}</strong>
            <span data-vc-slot="event-time">{format(event.start, "p")} – {format(event.end, "p")}</span>
            {event.description && <small data-vc-slot="event-description">{event.description}</small>}
          </button>;
        })}
        {currentOffset !== undefined && <div aria-hidden="true" style={{ "--vc-scheduler-offset": currentOffset } as React.CSSProperties} data-vc-scheduler-now data-vc-slot="current-time" />}
      </div>
    </div>
  </div>;
}

export default function Scheduler({ date, events, view = "day", weekStartsOn = 0, startHour = 8, endHour = 18, intervalMinutes = 60, interactionStepMinutes = 15, pixelsPerMinute = 1, minimumEventHeight = 30, currentTime, onEventSelect, onEventChange, ariaLabel, empty, className }: SchedulerProps) {
  const dates = view === "week" ? Array.from({ length: 7 }, (_, index) => addDays(startOfWeek(date, { weekStartsOn }), index)) : [date];
  const rootStyle = { "--vc-scheduler-scale": pixelsPerMinute, "--vc-scheduler-slot-minutes": intervalMinutes } as React.CSSProperties;
  return <section aria-label={ariaLabel ?? (view === "week" ? `Week of ${format(dates[0], "PPP")}` : `Schedule for ${format(date, "PPP")}`)} className={className} style={rootStyle} data-vc-component="scheduler" data-vc-slot="root" data-vc-view={view} data-vc-state={events.length > 0 ? "populated" : "empty"}>
    {view === "week" && <header data-vc-scheduler-header data-vc-slot="header">Week of {format(dates[0], "MMMM d, yyyy")}</header>}
    <div data-vc-slot="days">{dates.map((day) => <SchedulerDay key={day.toISOString()} date={day} events={events.filter((event) => isSameDay(event.start, day) || isSameDay(event.end, day))} startHour={startHour} endHour={endHour} intervalMinutes={intervalMinutes} interactionStepMinutes={interactionStepMinutes} pixelsPerMinute={pixelsPerMinute} minimumEventHeight={minimumEventHeight} currentTime={currentTime} onEventSelect={onEventSelect} onEventChange={onEventChange} empty={empty} />)}</div>
  </section>;
}
