"use client";

import type { ReactNode } from "react";
import Button from "./Button";
import Input from "./Input";
import Select from "./Select";
import Toggle from "./Toggle";

export type FilterDescriptor =
  | { id: string; type: "search"; label: string; placeholder?: string }
  | { id: string; type: "select"; label: string; options: Array<{ value: string; label: string }>; placeholder?: string }
  | { id: string; type: "toggle"; label: string; description?: string };
export type FilterValues = Record<string, string | boolean>;
export type FilterBarProps = { filters: FilterDescriptor[]; values: FilterValues; onValuesChange: (values: FilterValues) => void; onReset?: () => void; actions?: ReactNode; ariaLabel?: string; className?: string };

export default function FilterBar({ filters, values, onValuesChange, onReset, actions, ariaLabel = "Filters", className }: FilterBarProps) {
  const set = (id: string, value: string | boolean) => onValuesChange({ ...values, [id]: value });
  return (
    <div role="search" aria-label={ariaLabel} className={className} data-vc-component="filter-bar" data-vc-slot="root">
      <div data-vc-filter-controls>
        {filters.map((filter) => filter.type === "search"
          ? <label key={filter.id} data-vc-filter><span>{filter.label}</span><Input type="search" value={String(values[filter.id] ?? "")} placeholder={filter.placeholder} onChange={(event) => set(filter.id, event.currentTarget.value)} /></label>
          : filter.type === "select"
            ? <label key={filter.id} data-vc-filter><span>{filter.label}</span><Select value={String(values[filter.id] ?? "")} onChange={(event) => set(filter.id, event.currentTarget.value)}>{filter.placeholder && <option value="">{filter.placeholder}</option>}{filter.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</Select></label>
            : <Toggle key={filter.id} label={filter.label} description={filter.description} checked={Boolean(values[filter.id])} onCheckedChange={(checked) => set(filter.id, checked)} />)}
      </div>
      {(onReset || actions) && <div data-vc-filter-actions>{actions}{onReset && <Button onClick={onReset}>Reset filters</Button>}</div>}
    </div>
  );
}
