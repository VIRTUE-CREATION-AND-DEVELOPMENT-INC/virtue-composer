"use client";

import { useId, useMemo, useState, type ReactNode } from "react";
import Button from "./Button";
import useControllableState from "./useControllableState";

export type TransferListItem = {
  value: string;
  label: ReactNode;
  searchText?: string;
  description?: ReactNode;
  disabled?: boolean;
};

export type TransferListProps = {
  label: ReactNode;
  description?: ReactNode;
  items: TransferListItem[];
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  availableLabel?: string;
  selectedLabel?: string;
  searchPlaceholder?: string;
  moveToSelectedLabel?: string;
  moveToAvailableLabel?: string;
  name?: string;
  disabled?: boolean;
  className?: string;
};

export default function TransferList({
  label,
  description,
  items,
  value,
  defaultValue = [],
  onValueChange,
  availableLabel = "Available",
  selectedLabel = "Selected",
  searchPlaceholder = "Filter items",
  moveToSelectedLabel = "Add selected",
  moveToAvailableLabel = "Remove selected",
  name,
  disabled,
  className,
}: TransferListProps) {
  const descriptionId = useId();
  const [selectedValues, setSelectedValues] = useControllableState({ value, defaultValue, onChange: onValueChange });
  const [availableChecked, setAvailableChecked] = useState<string[]>([]);
  const [selectedChecked, setSelectedChecked] = useState<string[]>([]);
  const [availableQuery, setAvailableQuery] = useState("");
  const [selectedQuery, setSelectedQuery] = useState("");
  const selectedSet = useMemo(() => new Set(selectedValues), [selectedValues]);
  const matches = (item: TransferListItem, query: string) => !query || `${item.searchText ?? ""} ${typeof item.label === "string" ? item.label : ""}`.toLowerCase().includes(query.toLowerCase());
  const availableItems = items.filter((item) => !selectedSet.has(item.value) && matches(item, availableQuery));
  const chosenItems = selectedValues.map((itemValue) => items.find((item) => item.value === itemValue)).filter((item): item is TransferListItem => Boolean(item)).filter((item) => matches(item, selectedQuery));

  const toggleChecked = (side: "available" | "selected", itemValue: string, checked: boolean) => {
    const update = side === "available" ? setAvailableChecked : setSelectedChecked;
    update((current) => checked ? [...current, itemValue] : current.filter((value) => value !== itemValue));
  };
  const add = (values = availableChecked) => {
    const enabled = values.filter((itemValue) => !items.find((item) => item.value === itemValue)?.disabled);
    setSelectedValues([...selectedValues, ...enabled.filter((itemValue) => !selectedSet.has(itemValue))]);
    setAvailableChecked([]);
  };
  const remove = (values = selectedChecked) => {
    setSelectedValues(selectedValues.filter((itemValue) => !values.includes(itemValue)));
    setSelectedChecked([]);
  };

  const panel = (side: "available" | "selected", title: string, panelItems: TransferListItem[], query: string, setQuery: (query: string) => void, checkedValues: string[]) => <section aria-label={title} data-vc-slot="panel" data-vc-side={side}>
    <header data-vc-slot="panel-header"><h3>{title}</h3><span data-vc-slot="count">{panelItems.length}</span></header>
    <input type="search" value={query} onChange={(event) => setQuery(event.currentTarget.value)} aria-label={`${searchPlaceholder}, ${title}`} placeholder={searchPlaceholder} disabled={disabled} data-vc-slot="search" />
    <ul data-vc-slot="list">
      {panelItems.length === 0 && <li data-vc-slot="empty">No items</li>}
      {panelItems.map((item) => <li key={item.value} data-vc-slot="item" data-vc-disabled={item.disabled || undefined}>
        <label onDoubleClick={() => !disabled && !item.disabled && (side === "available" ? add([item.value]) : remove([item.value]))}>
          <input type="checkbox" checked={checkedValues.includes(item.value)} onChange={(event) => toggleChecked(side, item.value, event.currentTarget.checked)} disabled={disabled || item.disabled} />
          <span data-vc-slot="item-copy"><span data-vc-slot="item-label">{item.label}</span>{item.description && <small data-vc-slot="item-description">{item.description}</small>}</span>
        </label>
      </li>)}
    </ul>
  </section>;

  return <fieldset className={className} aria-describedby={description ? descriptionId : undefined} disabled={disabled} data-vc-component="transfer-list" data-vc-slot="root" data-vc-state={disabled ? "disabled" : selectedValues.length ? "selected" : "empty"}>
    <legend data-vc-slot="label">{label}</legend>
    {description && <p id={descriptionId} data-vc-slot="description">{description}</p>}
    <div data-vc-slot="layout">
      {panel("available", availableLabel, availableItems, availableQuery, setAvailableQuery, availableChecked)}
      <div data-vc-slot="actions">
        <Button onClick={() => add()} disabled={disabled || availableChecked.length === 0} aria-label={moveToSelectedLabel}>→</Button>
        <Button onClick={() => remove()} disabled={disabled || selectedChecked.length === 0} aria-label={moveToAvailableLabel}>←</Button>
      </div>
      {panel("selected", selectedLabel, chosenItems, selectedQuery, setSelectedQuery, selectedChecked)}
    </div>
    {name && selectedValues.map((itemValue) => <input key={itemValue} type="hidden" name={name} value={itemValue} data-vc-slot="hidden-input" />)}
  </fieldset>;
}
