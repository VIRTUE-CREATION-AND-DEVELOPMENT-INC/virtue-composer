import type { ReactNode } from "react";

export type SearchResultsSummaryProps = { query?: string; total: number; activeFilterCount?: number; sort?: ReactNode; children?: ReactNode; className?: string };

export default function SearchResultsSummary({ query, total, activeFilterCount = 0, sort, children, className }: SearchResultsSummaryProps) {
  return <div className={className} data-vc-component="search-results-summary" data-vc-slot="root">
    <p role="status" aria-live="polite"><strong>{total}</strong> {total === 1 ? "result" : "results"}{query ? <> for <q>{query}</q></> : null}{activeFilterCount > 0 ? <> with {activeFilterCount} active {activeFilterCount === 1 ? "filter" : "filters"}</> : null}</p>
    {sort && <div data-vc-search-sort>{sort}</div>}
    {children}
  </div>;
}
