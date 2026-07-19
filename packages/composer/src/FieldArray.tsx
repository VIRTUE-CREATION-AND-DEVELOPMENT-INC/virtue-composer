"use client";

import type { ReactNode } from "react";

export type FieldArrayItem = { id: string };
export type FieldArrayProps<Item extends FieldArrayItem> = { label: string; items: Item[]; onItemsChange: (items: Item[]) => void; createItem: () => Item; renderItem: (item: Item, index: number) => ReactNode; minItems?: number; maxItems?: number; addLabel?: string; className?: string };

export default function FieldArray<Item extends FieldArrayItem>({ label, items, onItemsChange, createItem, renderItem, minItems = 0, maxItems, addLabel = "Add item", className }: FieldArrayProps<Item>) {
  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items]; [next[index], next[target]] = [next[target], next[index]]; onItemsChange(next);
  };
  return <fieldset className={className} data-vc-component="field-array">
    <legend>{label}</legend>
    <ol>{items.map((item, index) => <li key={item.id}>
      <div>{renderItem(item, index)}</div>
      <div>
        <button type="button" onClick={() => move(index, -1)} disabled={index === 0}>Move item {index + 1} up</button>
        <button type="button" onClick={() => move(index, 1)} disabled={index === items.length - 1}>Move item {index + 1} down</button>
        <button type="button" onClick={() => onItemsChange(items.filter((candidate) => candidate.id !== item.id))} disabled={items.length <= minItems}>Remove item {index + 1}</button>
      </div>
    </li>)}</ol>
    <button type="button" onClick={() => onItemsChange([...items, createItem()])} disabled={maxItems !== undefined && items.length >= maxItems}>{addLabel}</button>
    <span aria-live="polite" data-vc-field-array-count>{items.length} items</span>
  </fieldset>;
}
