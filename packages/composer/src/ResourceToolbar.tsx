import type { ReactNode } from "react";

export type ResourceToolbarProps = { label?: string; search?: ReactNode; filters?: ReactNode; view?: ReactNode; actions?: ReactNode; resultCount?: number; status?: ReactNode; className?: string };

export default function ResourceToolbar({ label = "Resource controls", search, filters, view, actions, resultCount, status, className }: ResourceToolbarProps) {
  return <div role="toolbar" aria-label={label} className={className} data-vc-component="resource-toolbar" data-vc-slot="root">
    {search && <div data-vc-resource-search>{search}</div>}
    {filters && <div data-vc-resource-filters>{filters}</div>}
    {resultCount !== undefined && <output aria-live="polite" data-vc-resource-count>{resultCount} results</output>}
    {status && <div data-vc-resource-status>{status}</div>}
    {view && <div data-vc-resource-view>{view}</div>}
    {actions && <div data-vc-resource-actions>{actions}</div>}
  </div>;
}
