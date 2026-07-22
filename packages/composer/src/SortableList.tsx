"use client";

import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useId, type ReactNode } from "react";

export type SortableListItem = { id: string; content: ReactNode; disabled?: boolean };
export type SortableListProps = { items: SortableListItem[]; onReorder: (items: SortableListItem[]) => void; ariaLabel?: string; className?: string };

function SortableRow({ item }: { item: SortableListItem }) {
  const sortable = useSortable({ id: item.id, disabled: item.disabled });
  return <li ref={sortable.setNodeRef} style={{ transform: CSS.Transform.toString(sortable.transform), transition: sortable.transition }} data-vc-sortable-item data-vc-dragging={sortable.isDragging || undefined}>
    <button type="button" aria-label={`Move ${item.id}`} disabled={item.disabled} {...sortable.attributes} {...sortable.listeners}>Move</button>
    <div>{item.content}</div>
  </li>;
}

export default function SortableList({ items, onReorder, ariaLabel = "Sortable items", className }: SortableListProps) {
  const id = useId();
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  const finish = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const from = items.findIndex((item) => item.id === active.id);
    const to = items.findIndex((item) => item.id === over.id);
    if (from >= 0 && to >= 0) onReorder(arrayMove(items, from, to));
  };
  return <DndContext id={id} sensors={sensors} collisionDetection={closestCenter} onDragEnd={finish}>
    <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
      <ol aria-label={ariaLabel} className={className} data-vc-component="sortable-list" data-vc-slot="root">{items.map((item) => <SortableRow key={item.id} item={item} />)}</ol>
    </SortableContext>
  </DndContext>;
}
