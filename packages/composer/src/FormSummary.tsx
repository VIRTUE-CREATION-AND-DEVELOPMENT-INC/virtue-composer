"use client";

import { useEffect, useRef } from "react";

export type FormSummaryError = { id: string; label: string; message: string };
export type FormSummaryProps = { title?: string; errors?: FormSummaryError[]; status?: "idle" | "pending" | "success" | "error"; message?: string; focusOnMount?: boolean; className?: string };

export default function FormSummary({ title, errors = [], status = errors.length ? "error" : "idle", message, focusOnMount = true, className }: FormSummaryProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { if (focusOnMount && status === "error") ref.current?.focus(); }, [focusOnMount, status]);
  if (status === "idle" && errors.length === 0 && !message) return null;
  const role = status === "error" ? "alert" : "status";
  return <div ref={ref} role={role} tabIndex={status === "error" ? -1 : undefined} className={className} data-vc-component="form-summary" data-vc-status={status}>
    {title && <strong>{title}</strong>}
    {message && <p>{message}</p>}
    {errors.length > 0 && <ul>{errors.map((error) => <li key={error.id}><a href={`#${error.id}`}>{error.label}: {error.message}</a></li>)}</ul>}
  </div>;
}
