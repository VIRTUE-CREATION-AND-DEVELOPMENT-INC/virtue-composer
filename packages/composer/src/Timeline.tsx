import type { ReactNode } from "react";

export type TimelineItem = { id: string; title: ReactNode; description?: ReactNode; date?: ReactNode; icon?: ReactNode; status?: "complete" | "current" | "upcoming" | "error"; content?: ReactNode };
export type TimelineProps = { items: TimelineItem[]; ariaLabel?: string; className?: string };

export default function Timeline({ items, ariaLabel = "Timeline", className }: TimelineProps) {
  return <ol aria-label={ariaLabel} className={className} data-vc-component="timeline">{items.map((item) => <li key={item.id} data-vc-timeline-item data-vc-status={item.status ?? "complete"}>{item.icon && <span aria-hidden="true" data-vc-timeline-icon>{item.icon}</span>}<div data-vc-timeline-copy><div data-vc-timeline-heading><strong>{item.title}</strong>{item.date && <time>{item.date}</time>}</div>{item.description && <p>{item.description}</p>}{item.content && <div data-vc-timeline-content>{item.content}</div>}</div></li>)}</ol>;
}
