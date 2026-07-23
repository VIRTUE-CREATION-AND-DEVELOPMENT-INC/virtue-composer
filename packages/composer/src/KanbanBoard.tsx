"use client";

import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useDroppable, useSensor, useSensors, type DragEndEvent, type DragStartEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useId, useState, type ReactNode } from "react";
import useControllableState from "./useControllableState";

export type KanbanItem = { id: string; content: ReactNode; label?: string; disabled?: boolean; allowedColumnIds?: string[] };
export type KanbanColumn = { id: string; title: ReactNode; items: KanbanItem[]; description?: ReactNode; disabled?: boolean };
export type KanbanMove = { itemId: string; fromColumnId: string; toColumnId: string; toIndex: number };
export type KanbanBoardProps = { columns: KanbanColumn[]; onMove: (move: KanbanMove) => void; activeId?: string; defaultActiveId?: string; onActiveIdChange?: (id: string | undefined) => void; canMove?: (move: KanbanMove) => boolean; onMoveRejected?: (move: KanbanMove) => void; ariaLabel?: string; empty?: ReactNode; className?: string };

function SortableCard({ item }: { item: KanbanItem }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id, disabled: item.disabled });
  return <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} data-vc-kanban-item data-vc-slot="item" data-vc-state={isDragging ? "dragging" : item.disabled ? "disabled" : "idle"} data-vc-dragging={isDragging || undefined}>
    <button type="button" disabled={item.disabled} aria-label={`Move ${item.label ?? `item ${item.id}`}`} {...attributes} {...listeners} data-vc-kanban-handle data-vc-slot="handle">Move</button>
    <div data-vc-slot="item-content">{item.content}</div>
  </div>;
}

function KanbanColumnRegion({ column, empty }: { column: KanbanColumn; empty?: ReactNode }) {
  const { isOver, setNodeRef } = useDroppable({ id: column.id, disabled: column.disabled });
  return <section ref={setNodeRef} aria-disabled={column.disabled || undefined} data-vc-kanban-column data-vc-slot="column" data-vc-column-id={column.id} data-vc-state={column.disabled ? "disabled" : isOver ? "over" : column.items.length === 0 ? "empty" : "idle"}>
    <header data-vc-slot="column-header"><h3 data-vc-slot="column-title">{column.title}</h3>{column.description && <p data-vc-slot="column-description">{column.description}</p>}</header>
    <SortableContext id={column.id} items={column.items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
      <div data-vc-kanban-list data-vc-slot="list">{column.items.length === 0 && <div data-vc-kanban-empty data-vc-slot="empty">{empty}</div>}{column.items.map((item) => <SortableCard key={item.id} item={item} />)}</div>
    </SortableContext>
  </section>;
}

export default function KanbanBoard({ columns, onMove, activeId: controlledActiveId, defaultActiveId, onActiveIdChange, canMove, onMoveRejected, ariaLabel = "Kanban board", empty, className }: KanbanBoardProps) {
  const contextId = useId();
  const [activeId, setActiveId] = useControllableState<string | undefined>({ value: controlledActiveId, defaultValue: defaultActiveId, onChange: onActiveIdChange });
  const [announcement, setAnnouncement] = useState("");
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  const locate = (id: string) => columns.find((column) => column.id === id || column.items.some((item) => item.id === id));
  const dragStart = ({ active }: DragStartEvent) => { const id = String(active.id); setActiveId(id); const item = columns.flatMap((column) => column.items).find((candidate) => candidate.id === id); setAnnouncement(`Picked up ${item?.label ?? `item ${id}`}.`); };
  const dragEnd = ({ active, over }: DragEndEvent) => {
    setActiveId(undefined);
    if (!over) { setAnnouncement("Movement cancelled."); return; }
    const from = locate(String(active.id)); const to = locate(String(over.id));
    if (!from || !to) return;
    const item = from.items.find((candidate) => candidate.id === String(active.id));
    const fromIndex = from.items.findIndex((item) => item.id === active.id);
    const overIndex = to.items.findIndex((item) => item.id === over.id);
    const toIndex = over.id === to.id ? to.items.length : overIndex;
    if (from.id === to.id && fromIndex === toIndex) return;
    const move = { itemId: String(active.id), fromColumnId: from.id, toColumnId: to.id, toIndex: from.id === to.id ? arrayMove(from.items, fromIndex, toIndex).findIndex((candidate) => candidate.id === active.id) : toIndex };
    const allowed = !to.disabled && (!item?.allowedColumnIds || item.allowedColumnIds.includes(to.id)) && (canMove?.(move) ?? true);
    if (!allowed) { setAnnouncement(`${item?.label ?? "Item"} cannot be moved to this column.`); onMoveRejected?.(move); return; }
    onMove(move); setAnnouncement(`${item?.label ?? "Item"} moved to column ${to.id}, position ${move.toIndex + 1}.`);
  };
  return <DndContext id={contextId} sensors={sensors} collisionDetection={closestCenter} onDragStart={dragStart} onDragCancel={() => { setActiveId(undefined); setAnnouncement("Movement cancelled."); }} onDragEnd={dragEnd}>
    <div role="region" aria-label={ariaLabel} className={className} data-vc-component="kanban-board" data-vc-slot="root" data-vc-state={activeId ? "dragging" : columns.every((column) => column.items.length === 0) ? "empty" : "idle"} data-vc-active-id={activeId}>
      {columns.map((column) => <KanbanColumnRegion key={column.id} column={column} empty={empty} />)}
      <p role="status" aria-live="assertive" data-vc-slot="announcement">{announcement}</p>
    </div>
  </DndContext>;
}
