import type { ReactNode } from "react";

export type ChartLegendItem = { id: string; label: ReactNode; color?: string; value?: ReactNode; hidden?: boolean };
export type ChartLegendProps = { items: ChartLegendItem[]; ariaLabel?: string; className?: string };

export default function ChartLegend({ items, ariaLabel = "Chart legend", className }: ChartLegendProps) {
  return <ul aria-label={ariaLabel} className={className} data-vc-component="chart-legend" data-vc-slot="root">{items.map((item) => <li key={item.id} data-vc-legend-item data-vc-hidden={item.hidden || undefined}>{item.color && <span aria-hidden="true" style={{ backgroundColor: item.color }} data-vc-legend-swatch />}<span>{item.label}</span>{item.value && <strong>{item.value}</strong>}</li>)}</ul>;
}
