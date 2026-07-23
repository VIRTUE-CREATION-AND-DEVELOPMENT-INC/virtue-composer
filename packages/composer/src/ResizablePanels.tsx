"use client";

import { Fragment, useRef, type CSSProperties, type PointerEvent, type ReactNode } from "react";
import useControllableState from "./useControllableState";

export type ResizablePanel = {
  id: string;
  label: string;
  content: ReactNode;
  minSize?: number;
  maxSize?: number;
  collapsible?: boolean;
  collapsedSize?: number;
};

export type ResizablePanelsProps = {
  panels: ResizablePanel[];
  orientation?: "horizontal" | "vertical";
  value?: number[];
  defaultValue?: number[];
  onValueChange?: (sizes: number[]) => void;
  keyboardStep?: number;
  ariaLabel?: string;
  className?: string;
};

type DragState = { index: number; coordinate: number; sizes: number[] };

function normalizeSizes(sizes: number[] | undefined, count: number): number[] {
  if (count === 0) return [];
  if (!sizes || sizes.length !== count || sizes.some((size) => !Number.isFinite(size) || size < 0)) {
    return Array.from({ length: count }, () => 100 / count);
  }
  const total = sizes.reduce((sum, size) => sum + size, 0);
  if (total <= 0) return Array.from({ length: count }, () => 100 / count);
  return sizes.map((size) => (size / total) * 100);
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}

export default function ResizablePanels({
  panels,
  orientation = "horizontal",
  value,
  defaultValue,
  onValueChange,
  keyboardStep = 5,
  ariaLabel = "Resizable panels",
  className,
}: ResizablePanelsProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | undefined>(undefined);
  const restoreRef = useRef<Record<string, number>>({});
  const normalizedDefault = normalizeSizes(defaultValue, panels.length);
  const [storedSizes, setStoredSizes] = useControllableState<number[]>({ value, defaultValue: normalizedDefault, onChange: onValueChange });
  const sizes = normalizeSizes(storedSizes, panels.length);

  const limits = (index: number, baseSizes = sizes) => {
    const before = panels[index];
    const after = panels[index + 1];
    const pairTotal = baseSizes[index] + baseSizes[index + 1];
    const beforeMinimum = before.collapsible ? before.collapsedSize ?? 0 : before.minSize ?? 10;
    const afterMinimum = after.collapsible ? after.collapsedSize ?? 0 : after.minSize ?? 10;
    const beforeMaximum = before.maxSize ?? 100;
    const afterMaximum = after.maxSize ?? 100;
    return {
      minimum: Math.max(beforeMinimum, pairTotal - afterMaximum),
      maximum: Math.min(beforeMaximum, pairTotal - afterMinimum),
      pairTotal,
    };
  };

  const resize = (index: number, nextBefore: number, baseSizes = sizes) => {
    const { minimum, maximum, pairTotal } = limits(index, baseSizes);
    const before = clamp(nextBefore, minimum, maximum);
    const next = [...baseSizes];
    next[index] = before;
    next[index + 1] = pairTotal - before;
    setStoredSizes(next);
  };

  const collapsed = (panel: ResizablePanel, size: number) => panel.collapsible && size <= (panel.collapsedSize ?? 0) + 0.01;

  const toggleCollapse = (index: number) => {
    const before = panels[index];
    const after = panels[index + 1];
    const targetIndex = before.collapsible ? index : after.collapsible ? index + 1 : -1;
    if (targetIndex < 0) return;
    const target = panels[targetIndex];
    const currentSize = sizes[targetIndex];
    const isCollapsed = collapsed(target, currentSize);
    if (targetIndex === index) {
      if (!isCollapsed) restoreRef.current[target.id] = currentSize;
      resize(index, isCollapsed ? restoreRef.current[target.id] ?? Math.max(target.minSize ?? 10, 25) : target.collapsedSize ?? 0);
    } else {
      if (!isCollapsed) restoreRef.current[target.id] = currentSize;
      const restored = isCollapsed ? restoreRef.current[target.id] ?? Math.max(target.minSize ?? 10, 25) : target.collapsedSize ?? 0;
      resize(index, limits(index).pairTotal - restored);
    }
  };

  const keyResize = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    const decreaseKeys = orientation === "horizontal" ? ["ArrowLeft"] : ["ArrowUp"];
    const increaseKeys = orientation === "horizontal" ? ["ArrowRight"] : ["ArrowDown"];
    const { minimum, maximum } = limits(index);
    let next: number | undefined;
    if (decreaseKeys.includes(event.key)) next = sizes[index] - keyboardStep;
    if (increaseKeys.includes(event.key)) next = sizes[index] + keyboardStep;
    if (event.key === "Home") next = minimum;
    if (event.key === "End") next = maximum;
    if (event.key === "Enter" && (panels[index].collapsible || panels[index + 1].collapsible)) {
      event.preventDefault();
      toggleCollapse(index);
      return;
    }
    if (next === undefined) return;
    event.preventDefault();
    resize(index, next);
  };

  const pointerDown = (event: PointerEvent<HTMLButtonElement>, index: number) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { index, coordinate: orientation === "horizontal" ? event.clientX : event.clientY, sizes };
  };

  const pointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    const root = rootRef.current;
    if (!drag || !root || drag.index < 0) return;
    const rect = root.getBoundingClientRect();
    const length = orientation === "horizontal" ? rect.width : rect.height;
    if (length <= 0) return;
    const coordinate = orientation === "horizontal" ? event.clientX : event.clientY;
    resize(drag.index, drag.sizes[drag.index] + ((coordinate - drag.coordinate) / length) * 100, drag.sizes);
  };

  const pointerUp = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    dragRef.current = undefined;
  };

  return (
    <div
      ref={rootRef}
      role="group"
      aria-label={ariaLabel}
      className={className}
      style={{ display: "flex", flexDirection: orientation === "horizontal" ? "row" : "column" } as CSSProperties}
      data-vc-component="resizable-panels"
      data-vc-slot="root"
      data-vc-orientation={orientation}
    >
      {panels.map((panel, index) => {
        const isCollapsed = collapsed(panel, sizes[index]);
        const pairLimits = index < panels.length - 1 ? limits(index) : undefined;
        return (
          <Fragment key={panel.id}>
            <section
              aria-label={panel.label}
              aria-hidden={isCollapsed || undefined}
              style={{ flexBasis: `${sizes[index]}%`, minWidth: 0, minHeight: 0 }}
              data-vc-slot="panel"
              data-vc-panel-id={panel.id}
              data-vc-collapsed={isCollapsed || undefined}
            >
              {!isCollapsed && panel.content}
            </section>
            {index < panels.length - 1 && pairLimits && <button
              type="button"
              role="separator"
              aria-label={`Resize ${panel.label} and ${panels[index + 1].label}`}
              aria-orientation={orientation === "horizontal" ? "vertical" : "horizontal"}
              aria-valuemin={Math.round(pairLimits.minimum)}
              aria-valuemax={Math.round(pairLimits.maximum)}
              aria-valuenow={Math.round(sizes[index])}
              aria-valuetext={`${panel.label} ${Math.round(sizes[index])} percent`}
              onKeyDown={(event) => keyResize(event, index)}
              onPointerDown={(event) => pointerDown(event, index)}
              onPointerMove={pointerMove}
              onPointerUp={pointerUp}
              onPointerCancel={pointerUp}
              onDoubleClick={() => toggleCollapse(index)}
              data-vc-slot="separator"
              data-vc-resize-index={index}
            />}
          </Fragment>
        );
      })}
    </div>
  );
}
