"use client";

import { flexRender, functionalUpdate, getCoreRowModel, getFilteredRowModel, getSortedRowModel, useReactTable, type Column, type ColumnDef, type ColumnPinningState, type RowSelectionState, type SortingState, type Updater, type VisibilityState } from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";

export type DataGridColumn<Row> = { id: string; header: ReactNode; accessorKey?: keyof Row & string; cell?: (row: Row) => ReactNode; sortable?: boolean; size?: number; minSize?: number; maxSize?: number; align?: "start" | "center" | "end" };
export type DataGridProps<Row extends { id: string }> = { rows: Row[]; columns: DataGridColumn<Row>[]; caption?: string; selectable?: boolean; selectedIds?: string[]; defaultSelectedIds?: string[]; onSelectedIdsChange?: (ids: string[]) => void; sorting?: SortingState; defaultSorting?: SortingState; onSortingChange?: (sorting: SortingState) => void; globalFilter?: string; defaultGlobalFilter?: string; onGlobalFilterChange?: (value: string) => void; columnVisibility?: VisibilityState; defaultColumnVisibility?: VisibilityState; onColumnVisibilityChange?: (visibility: VisibilityState) => void; pinnedColumns?: ColumnPinningState; manualSorting?: boolean; manualFiltering?: boolean; rowCount?: number; virtualize?: boolean; height?: number | string; estimateRowHeight?: number; overscan?: number; empty?: ReactNode; className?: string };

export default function DataGrid<Row extends { id: string }>({ rows, columns, caption, selectable = false, selectedIds, defaultSelectedIds = [], onSelectedIdsChange, sorting, defaultSorting = [], onSortingChange, globalFilter, defaultGlobalFilter = "", onGlobalFilterChange, columnVisibility, defaultColumnVisibility = {}, onColumnVisibilityChange, pinnedColumns, manualSorting = false, manualFiltering = false, rowCount, virtualize = false, height = 420, estimateRowHeight = 44, overscan = 6, empty, className }: DataGridProps<Row>) {
  const [internalSorting, setInternalSorting] = useState<SortingState>(defaultSorting);
  const [internalSelection, setInternalSelection] = useState<RowSelectionState>(() => Object.fromEntries(defaultSelectedIds.map((id) => [id, true])));
  const [internalFilter, setInternalFilter] = useState(defaultGlobalFilter);
  const [internalVisibility, setInternalVisibility] = useState<VisibilityState>(defaultColumnVisibility);
  const viewportRef = useRef<HTMLDivElement>(null);
  const resolvedSorting = sorting ?? internalSorting;
  const resolvedSelection = selectedIds ? Object.fromEntries(selectedIds.map((id) => [id, true])) : internalSelection;
  const resolvedFilter = globalFilter ?? internalFilter;
  const resolvedVisibility = columnVisibility ?? internalVisibility;
  const resolvedPinning = pinnedColumns ?? { left: [], right: [] };
  const defs = useMemo<ColumnDef<Row>[]>(() => {
    const dataColumns = columns.map((column): ColumnDef<Row> => ({ id: column.id, header: () => column.header, accessorKey: column.accessorKey, cell: column.cell ? ({ row }) => column.cell!(row.original) : ({ getValue }) => getValue() as ReactNode, enableSorting: column.sortable, size: column.size, minSize: column.minSize, maxSize: column.maxSize, meta: { align: column.align } }));
    if (!selectable) return dataColumns;
    return [{ id: "__select__", size: 42, enableSorting: false, enableResizing: false, header: ({ table }) => <input type="checkbox" aria-label="Select all rows" checked={table.getIsAllRowsSelected()} ref={(node) => { if (node) node.indeterminate = table.getIsSomeRowsSelected(); }} onChange={table.getToggleAllRowsSelectedHandler()} data-vc-slot="select-all" />, cell: ({ row }) => <input type="checkbox" aria-label={`Select row ${row.id}`} checked={row.getIsSelected()} disabled={!row.getCanSelect()} onChange={row.getToggleSelectedHandler()} data-vc-slot="select-row" /> }, ...dataColumns];
  }, [columns, selectable]);
  const updateSorting = (updater: Updater<SortingState>) => { const next = functionalUpdate(updater, resolvedSorting); if (sorting === undefined) setInternalSorting(next); onSortingChange?.(next); };
  const updateSelection = (updater: Updater<RowSelectionState>) => { const next = functionalUpdate(updater, resolvedSelection); if (selectedIds === undefined) setInternalSelection(next); onSelectedIdsChange?.(Object.keys(next).filter((id) => next[id])); };
  const updateFilter = (updater: Updater<unknown>) => { const next = String(functionalUpdate(updater, resolvedFilter) ?? ""); if (globalFilter === undefined) setInternalFilter(next); onGlobalFilterChange?.(next); };
  const updateVisibility = (updater: Updater<VisibilityState>) => { const next = functionalUpdate(updater, resolvedVisibility); if (columnVisibility === undefined) setInternalVisibility(next); onColumnVisibilityChange?.(next); };
  const table = useReactTable({ data: rows, columns: defs, getRowId: (row) => row.id, getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel(), getFilteredRowModel: getFilteredRowModel(), enableRowSelection: selectable, columnResizeMode: "onChange", manualSorting, manualFiltering, rowCount, state: { sorting: resolvedSorting, rowSelection: resolvedSelection, globalFilter: resolvedFilter, columnVisibility: resolvedVisibility, columnPinning: resolvedPinning }, onSortingChange: updateSorting, onRowSelectionChange: updateSelection, onGlobalFilterChange: updateFilter, onColumnVisibilityChange: updateVisibility });
  const columnStyle = (column: Column<Row>) => {
    const pinned = column.getIsPinned();
    return { width: column.getSize(), left: pinned === "left" ? column.getStart("left") : undefined, right: pinned === "right" ? column.getAfter("right") : undefined, position: pinned ? "sticky" : undefined, zIndex: pinned ? 1 : undefined } as React.CSSProperties;
  };
  const resizeWithKeyboard = (column: Column<Row>, event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const direction = event.key === "ArrowRight" ? 1 : -1;
    const min = column.columnDef.minSize ?? 20;
    const max = column.columnDef.maxSize ?? Number.MAX_SAFE_INTEGER;
    const next = Math.max(min, Math.min(max, column.getSize() + direction * (event.shiftKey ? 25 : 10)));
    table.setColumnSizing((current) => ({ ...current, [column.id]: next }));
  };
  const visibleRows = table.getRowModel().rows;
  const rowVirtualizer = useVirtualizer({ count: visibleRows.length, getScrollElement: () => viewportRef.current, estimateSize: () => estimateRowHeight, overscan, enabled: virtualize });
  const virtualItems = virtualize ? rowVirtualizer.getVirtualItems() : [];
  const renderedRows = virtualize ? virtualItems.map((item) => visibleRows[item.index]) : visibleRows;
  const topPadding = virtualize && virtualItems.length ? virtualItems[0].start : 0;
  const bottomPadding = virtualize && virtualItems.length ? rowVirtualizer.getTotalSize() - virtualItems[virtualItems.length - 1].end : 0;
  return <div className={className} data-vc-component="data-grid" data-vc-slot="root" data-vc-state={visibleRows.length === 0 ? "empty" : "populated"} data-vc-sorted={resolvedSorting.length > 0 || undefined} data-vc-selected={Object.values(resolvedSelection).some(Boolean) || undefined} data-vc-virtualized={virtualize || undefined}>
    <div ref={viewportRef} style={virtualize ? { height, overflow: "auto" } : undefined} data-vc-slot="viewport">
    <table style={{ width: table.getTotalSize() }} data-vc-slot="table">
      {caption && <caption data-vc-slot="caption">{caption}</caption>}
      <thead data-vc-slot="header">
        {table.getHeaderGroups().map((group) => <tr key={group.id} data-vc-slot="header-row">
          {group.headers.map((header) => <th key={header.id} colSpan={header.colSpan} style={columnStyle(header.column)} aria-sort={header.column.getIsSorted() === "asc" ? "ascending" : header.column.getIsSorted() === "desc" ? "descending" : undefined} data-vc-pinned={header.column.getIsPinned() || undefined} data-vc-align={(header.column.columnDef.meta as { align?: string } | undefined)?.align} data-vc-slot="header-cell">
            <div data-vc-slot="header-content">{header.isPlaceholder ? null : header.column.getCanSort() ? <button type="button" onClick={header.column.getToggleSortingHandler()} data-vc-slot="sort-trigger">{flexRender(header.column.columnDef.header, header.getContext())}</button> : flexRender(header.column.columnDef.header, header.getContext())}</div>
            {header.column.getCanResize() && <div role="separator" aria-orientation="vertical" aria-label={`Resize ${header.id} column`} aria-valuemin={header.column.columnDef.minSize ?? 20} aria-valuemax={header.column.columnDef.maxSize ?? undefined} aria-valuenow={header.column.getSize()} tabIndex={0} onKeyDown={(event) => resizeWithKeyboard(header.column, event)} onDoubleClick={() => header.column.resetSize()} onMouseDown={header.getResizeHandler()} onTouchStart={header.getResizeHandler()} data-vc-column-resizer data-vc-resizing={header.column.getIsResizing() || undefined} data-vc-slot="resizer" />}
          </th>)}
        </tr>)}
      </thead>
      <tbody data-vc-slot="body">
        {visibleRows.length === 0
          ? <tr data-vc-slot="empty-row"><td colSpan={table.getVisibleLeafColumns().length} data-vc-grid-empty data-vc-slot="empty">{empty}</td></tr>
          : <>{topPadding > 0 && <tr aria-hidden="true"><td colSpan={table.getVisibleLeafColumns().length} style={{ height: topPadding, padding: 0, border: 0 }} /></tr>}{renderedRows.map((row) => <tr key={row.id} data-vc-selected={row.getIsSelected() || undefined} data-vc-slot="row">
            {row.getVisibleCells().map((cell) => <td key={cell.id} style={columnStyle(cell.column)} data-vc-pinned={cell.column.getIsPinned() || undefined} data-vc-align={(cell.column.columnDef.meta as { align?: string } | undefined)?.align} data-vc-slot="cell">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>)}
          </tr>)}{bottomPadding > 0 && <tr aria-hidden="true"><td colSpan={table.getVisibleLeafColumns().length} style={{ height: bottomPadding, padding: 0, border: 0 }} /></tr>}</>}
      </tbody>
    </table>
    </div>
  </div>;
}
