import type { ReactNode } from "react";

export type AuditLogItem = { id: string; actor: ReactNode; action: ReactNode; timestamp: string; dateTime?: string; summary?: ReactNode; details?: Array<{ label: ReactNode; before?: ReactNode; after?: ReactNode }> };
export type AuditLogProps = { items: AuditLogItem[]; ariaLabel?: string; empty?: ReactNode; className?: string };

export default function AuditLog({ items, ariaLabel = "Audit log", empty = "No activity recorded", className }: AuditLogProps) {
  return <section aria-label={ariaLabel} className={className} data-vc-component="audit-log">
    {items.length === 0 ? <p data-vc-audit-empty>{empty}</p> : <ol>{items.map((item) => <li key={item.id}>
      <header><strong>{item.actor}</strong> <span>{item.action}</span> <time dateTime={item.dateTime}>{item.timestamp}</time></header>
      {item.summary && <p>{item.summary}</p>}
      {item.details && item.details.length > 0 && <details><summary>View changes</summary><dl>{item.details.map((detail, index) => <div key={index}><dt>{detail.label}</dt>{detail.before !== undefined && <dd><span>Before: </span>{detail.before}</dd>}{detail.after !== undefined && <dd><span>After: </span>{detail.after}</dd>}</div>)}</dl></details>}
    </li>)}</ol>}
  </section>;
}
