"use client";

export type ActiveFilter = { id: string; label: string; value?: string };
export type ActiveFiltersProps = { filters: ActiveFilter[]; onRemove: (id: string) => void; onClear?: () => void; ariaLabel?: string; clearLabel?: string; className?: string };

export default function ActiveFilters({ filters, onRemove, onClear, ariaLabel = "Active filters", clearLabel = "Clear all filters", className }: ActiveFiltersProps) {
  if (filters.length === 0) return null;
  return <div className={className} data-vc-component="active-filters" data-vc-slot="root">
    <ul aria-label={ariaLabel}>{filters.map((filter) => <li key={filter.id}><span>{filter.label}{filter.value ? `: ${filter.value}` : ""}</span><button type="button" onClick={() => onRemove(filter.id)} aria-label={`Remove ${filter.label}${filter.value ? ` ${filter.value}` : ""} filter`}>×</button></li>)}</ul>
    {onClear && <button type="button" onClick={onClear}>{clearLabel}</button>}
  </div>;
}
