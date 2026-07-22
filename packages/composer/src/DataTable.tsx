"use client";

import { useMemo, useState, type ReactNode } from "react";

export type SortDirection = "ascending" | "descending";
export type DataTableColumn<Row> = { id: string; header: ReactNode; accessor?: keyof Row; cell?: (row: Row) => ReactNode; sortable?: boolean; align?: "start" | "center" | "end" };
export type DataTableProps<Row extends { id: string }> = { rows: Row[]; columns: DataTableColumn<Row>[]; caption?: string; sort?: { columnId: string; direction: SortDirection }; defaultSort?: { columnId: string; direction: SortDirection }; onSortChange?: (sort: { columnId: string; direction: SortDirection }) => void; empty?: ReactNode; className?: string };

export default function DataTable<Row extends { id: string }>({ rows, columns, caption, sort, defaultSort, onSortChange, empty, className }: DataTableProps<Row>) {
  const [internalSort, setInternalSort] = useState(defaultSort);
  const currentSort = sort ?? internalSort;
  const sortedRows = useMemo(() => {
    if (!currentSort) return rows;
    const column = columns.find((candidate) => candidate.id === currentSort.columnId);
    if (!column?.accessor) return rows;
    return [...rows].sort((a, b) => {
      const left = a[column.accessor!];
      const right = b[column.accessor!];
      const comparison = String(left ?? "").localeCompare(String(right ?? ""), undefined, { numeric: true });
      return currentSort.direction === "ascending" ? comparison : -comparison;
    });
  }, [columns, currentSort, rows]);
  const changeSort = (columnId: string) => {
    const next = { columnId, direction: currentSort?.columnId === columnId && currentSort.direction === "ascending" ? "descending" as const : "ascending" as const };
    if (sort === undefined) setInternalSort(next);
    onSortChange?.(next);
  };

  return (
    <div className={className} data-vc-component="data-table" data-vc-slot="root">
      <table>
        {caption && <caption>{caption}</caption>}
        <thead><tr>{columns.map((column) => <th key={column.id} scope="col" aria-sort={currentSort?.columnId === column.id ? currentSort.direction : undefined} data-vc-align={column.align}>{column.sortable ? <button type="button" onClick={() => changeSort(column.id)}>{column.header}<span aria-hidden="true" data-vc-sort-indicator /></button> : column.header}</th>)}</tr></thead>
        <tbody>{sortedRows.length === 0 ? <tr><td colSpan={columns.length} data-vc-table-empty>{empty}</td></tr> : sortedRows.map((row) => <tr key={row.id}>{columns.map((column) => <td key={column.id} data-vc-align={column.align}>{column.cell ? column.cell(row) : column.accessor ? String(row[column.accessor] ?? "") : null}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}
