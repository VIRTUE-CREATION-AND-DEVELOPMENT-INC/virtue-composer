"use client";

import { useId, type ReactNode } from "react";

export type ImportColumn = { key: string; label: string };
export type ImportRow = { id: string; values: Record<string, ReactNode>; valid?: boolean };
export type ImportError = { id: string; message: string; row?: number; field?: string };
export type ImportPanelProps = { title: string; description?: string; accept?: string; file?: File; onFileChange?: (file: File | undefined) => void; columns?: ImportColumn[]; rows?: ImportRow[]; errors?: ImportError[]; onCommit?: () => void; onReset?: () => void; pending?: boolean; className?: string };

export default function ImportPanel({ title, description, accept = ".csv,text/csv", file, onFileChange, columns = [], rows = [], errors = [], onCommit, onReset, pending, className }: ImportPanelProps) {
  const id = useId();
  const valid = Boolean(file) && errors.length === 0;
  return <section aria-labelledby={id} className={className} aria-busy={pending || undefined} data-vc-component="import-panel">
    <header><h3 id={id}>{title}</h3>{description && <p>{description}</p>}</header>
    <label>Import file <input type="file" accept={accept} onChange={(event) => onFileChange?.(event.currentTarget.files?.[0])} /></label>
    {file && <p data-vc-import-file>{file.name}</p>}
    {errors.length > 0 && <div role="alert" tabIndex={-1} data-vc-import-errors><strong>{errors.length} import errors</strong><ul>{errors.map((error) => <li key={error.id}>{error.row ? `Row ${error.row}: ` : ""}{error.field ? `${error.field}: ` : ""}{error.message}</li>)}</ul></div>}
    {rows.length > 0 && <div data-vc-import-preview><table><caption>Import preview</caption><thead><tr>{columns.map((column) => <th key={column.key} scope="col">{column.label}</th>)}</tr></thead><tbody>{rows.map((row) => <tr key={row.id} data-vc-invalid={row.valid === false || undefined}>{columns.map((column) => <td key={column.key}>{row.values[column.key]}</td>)}</tr>)}</tbody></table></div>}
    {file && <footer>{onReset && <button type="button" onClick={onReset} disabled={pending}>Reset</button>}{onCommit && <button type="button" onClick={onCommit} disabled={!valid || pending}>{pending ? "Importing…" : "Import"}</button>}</footer>}
  </section>;
}
