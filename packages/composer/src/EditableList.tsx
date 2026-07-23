"use client";

import { useId, useRef, useState, type ReactNode } from "react";
import Button from "./Button";
import useControllableState from "./useControllableState";

export type EditableListItem = { id: string; value: string; disabled?: boolean; metadata?: ReactNode };
export type EditableListProps = {
  label: ReactNode;
  items?: EditableListItem[];
  defaultItems?: EditableListItem[];
  onItemsChange?: (items: EditableListItem[]) => void;
  createItem?: () => EditableListItem;
  validate?: (value: string, item: EditableListItem) => string | undefined | Promise<string | undefined>;
  onItemSave?: (item: EditableListItem) => void | string | undefined | Promise<void | string | undefined>;
  minItems?: number;
  maxItems?: number;
  addLabel?: string;
  empty?: ReactNode;
  disabled?: boolean;
  className?: string;
};

export default function EditableList({ label, items, defaultItems = [], onItemsChange, createItem = () => ({ id: crypto.randomUUID(), value: "" }), validate, onItemSave, minItems = 0, maxItems = Number.POSITIVE_INFINITY, addLabel = "Add item", empty = "No items", disabled, className }: EditableListProps) {
  const id = useId();
  const [current, setCurrent] = useControllableState({ value: items, defaultValue: defaultItems, onChange: onItemsChange });
  const [editingId, setEditingId] = useState<string>();
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string>();
  const [pendingId, setPendingId] = useState<string>();
  const editButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const change = (next: EditableListItem[]) => setCurrent(next);
  const startEdit = (item: EditableListItem) => { setDraft(item.value); setError(undefined); setEditingId(item.id); };
  const cancel = () => { const previous = editingId; setEditingId(undefined); setError(undefined); queueMicrotask(() => previous && editButtonRefs.current[previous]?.focus()); };
  const save = async (item: EditableListItem) => {
    const validationError = await validate?.(draft, item);
    if (validationError) { setError(validationError); return; }
    const nextItem = { ...item, value: draft };
    setPendingId(item.id);
    try {
      const saveError = await onItemSave?.(nextItem);
      if (typeof saveError === "string") { setError(saveError); return; }
      change(current.map((candidate) => candidate.id === item.id ? nextItem : candidate));
      setEditingId(undefined);
      queueMicrotask(() => editButtonRefs.current[item.id]?.focus());
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not save this item."); }
    finally { setPendingId(undefined); }
  };
  const move = (index: number, offset: number) => { const nextIndex = index + offset; if (nextIndex < 0 || nextIndex >= current.length) return; const next = [...current]; const [item] = next.splice(index, 1); next.splice(nextIndex, 0, item); change(next); };
  const add = () => { if (current.length >= maxItems) return; const item = createItem(); change([...current, item]); setDraft(item.value); setEditingId(item.id); };
  const remove = (item: EditableListItem) => { if (current.length <= minItems) return; change(current.filter((candidate) => candidate.id !== item.id)); };

  return <section aria-labelledby={`${id}-label`} className={className} data-vc-component="editable-list" data-vc-slot="root" data-vc-state={disabled ? "disabled" : current.length ? "populated" : "empty"}>
    <header data-vc-slot="header"><h3 id={`${id}-label`}>{label}</h3><span aria-live="polite" data-vc-slot="count">{current.length} items</span></header>
    {current.length === 0 ? <div data-vc-slot="empty">{empty}</div> : <ol data-vc-slot="list">{current.map((item, index) => <li key={item.id} data-vc-slot="item" data-vc-disabled={item.disabled || undefined}>
      {editingId === item.id ? <div role="group" aria-label={`Edit item ${index + 1}`} data-vc-slot="edit-form">
        <input autoFocus value={draft} onChange={(event) => { setDraft(event.currentTarget.value); setError(undefined); }} aria-label={`Item ${index + 1}`} aria-invalid={Boolean(error) || undefined} aria-describedby={error ? `${id}-${item.id}-error` : undefined} disabled={pendingId === item.id} />
        {error && <p id={`${id}-${item.id}-error`} role="alert">{error}</p>}
        <Button onClick={() => void save(item)} loading={pendingId === item.id} loadingLabel="Saving">Save</Button><Button onClick={cancel} disabled={pendingId === item.id}>Cancel</Button>
      </div> : <><div data-vc-slot="item-copy"><span data-vc-slot="value">{item.value}</span>{item.metadata && <small data-vc-slot="metadata">{item.metadata}</small>}</div><div data-vc-slot="item-actions">
        <Button onClick={() => move(index, -1)} disabled={disabled || item.disabled || index === 0} aria-label={`Move item ${index + 1} up`}>↑</Button>
        <Button onClick={() => move(index, 1)} disabled={disabled || item.disabled || index === current.length - 1} aria-label={`Move item ${index + 1} down`}>↓</Button>
        <Button ref={(node) => { editButtonRefs.current[item.id] = node; }} onClick={() => startEdit(item)} disabled={disabled || item.disabled} aria-label={`Edit item ${index + 1}`}>Edit</Button>
        <Button onClick={() => remove(item)} disabled={disabled || item.disabled || current.length <= minItems} aria-label={`Remove item ${index + 1}`}>Remove</Button>
      </div></>}
    </li>)}</ol>}
    <Button onClick={add} disabled={disabled || current.length >= maxItems} data-vc-slot="add">{addLabel}</Button>
  </section>;
}
