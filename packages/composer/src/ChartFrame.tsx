import type { ReactNode } from "react";

export type ChartFrameProps = { title: ReactNode; description?: ReactNode; children: ReactNode; legend?: ReactNode; actions?: ReactNode; summary?: ReactNode; ariaLabel?: string; className?: string };

export default function ChartFrame({ title, description, children, legend, actions, summary, ariaLabel, className }: ChartFrameProps) {
  return <figure aria-label={ariaLabel ?? (typeof title === "string" ? title : undefined)} className={className} data-vc-component="chart-frame"><figcaption data-vc-chart-caption><div><div data-vc-chart-title>{title}</div>{description && <p>{description}</p>}</div>{actions && <div data-vc-chart-actions>{actions}</div>}</figcaption><div data-vc-chart-plot>{children}</div>{legend && <div data-vc-chart-legend-slot>{legend}</div>}{summary && <div data-vc-chart-summary>{summary}</div>}</figure>;
}
