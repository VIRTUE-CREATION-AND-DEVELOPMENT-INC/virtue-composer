"use client";

import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useId, type ReactNode } from "react";

export type KanbanItem = { id: string; content: ReactNode; disabled?: boolean };
export type KanbanColumn = { id: string; title: ReactNode; items: KanbanItem[]; description?: ReactNode };
export type KanbanMove = { itemId: string; fromColumnId: string; toColumnId: string; toIndex: number };
export type KanbanBoardProps = { columns: KanbanColumn[]; onMove: (move: KanbanMove) => void; ariaLabel?: string; className?: string };

function SortableCard({ item }: { item: KanbanItem }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id, disabled: item.disabled });
  return <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} data-vc-kanban-item data-vc-dragging={isDragging || undefined}><button type="button" disabled={item.disabled} aria-label={`Move item ${item.id}`} {...attributes} {...listeners} data-vc-kanban-handle>Move</button><div>{item.content}</div></div>;
}

export default function KanbanBoard({ columns, onMove, ariaLabel = "Kanban board", className }: KanbanBoardProps) {
  const contextId = useId();
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  const locate = (id: string) => columns.find((column) => column.id === id || column.items.some((item) => item.id === id));
  const dragEnd = ({ active, over }: DragEndEvent) => {
    if (!over) return;
    const from = locate(String(active.id)); const to = locate(String(over.id));
    if (!from || !to) return;
    const fromIndex = from.items.findIndex((item) => item.id === active.id);
    const overIndex = to.items.findIndex((item) => item.id === over.id);
    const toIndex = over.id === to.id ? to.items.length : overIndex;
    if (from.id === to.id && fromIndex === toIndex) return;
    onMove({ itemId: String(active.id), fromColumnId: from.id, toColumnId: to.id, toIndex: from.id === to.id ? arrayMove(from.items, fromIndex, toIndex).findIndex((item) => item.id === active.id) : toIndex });
  };
  return <DndContext id={contextId} sensors={sensors} collisionDetection={closestCenter} onDragEnd={dragEnd}><div role="region" aria-label={ariaLabel} className={className} data-vc-component="kanban-board">{columns.map((column) => <section key={column.id} data-vc-kanban-column><header><h3>{column.title}</h3>{column.description && <p>{column.description}</p>}</header><SortableContext id={column.id} items={column.items.map((item) => item.id)} strategy={verticalListSortingStrategy}><div data-vc-kanban-list>{column.items.map((item) => <SortableCard key={item.id} item={item} />)}</div></SortableContext></section>)}</div></DndContext>;
}
