"use client";

import type { ReactNode } from "react";

export type BulkAction = { id: string; label: string; icon?: ReactNode; disabled?: boolean; destructive?: boolean };
export type BulkActionBarProps = { selectedCount: number; actions: BulkAction[]; onAction?: (id: string) => void; onClear?: () => void; pendingActionId?: string; ariaLabel?: string; className?: string };

export default function BulkActionBar({ selectedCount, actions, onAction, onClear, pendingActionId, ariaLabel = "Bulk actions", className }: BulkActionBarProps) {
  if (selectedCount <= 0) return null;
  return <div role="toolbar" aria-label={ariaLabel} className={className} aria-busy={Boolean(pendingActionId) || undefined} data-vc-component="bulk-action-bar">
    <span aria-live="polite">{selectedCount} selected</span>
    <div>{actions.map((action) => <button key={action.id} type="button" onClick={() => onAction?.(action.id)} disabled={action.disabled || Boolean(pendingActionId)} data-vc-destructive={action.destructive || undefined}>
      {action.icon && <span aria-hidden="true">{action.icon}</span>}{pendingActionId === action.id ? `${action.label}…` : action.label}
    </button>)}</div>
    {onClear && <button type="button" onClick={onClear} disabled={Boolean(pendingActionId)}>Clear selection</button>}
  </div>;
}
