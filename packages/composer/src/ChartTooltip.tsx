import type { ReactNode } from "react";

export type ChartTooltipItem = { id: string; label: ReactNode; value: ReactNode; color?: string };
export type ChartTooltipProps = { label?: ReactNode; items: ChartTooltipItem[]; active?: boolean; className?: string };

export default function ChartTooltip({ label, items, active = true, className }: ChartTooltipProps) {
  if (!active) return null;
  return <div role="tooltip" className={className} data-vc-component="chart-tooltip" data-vc-slot="root">{label && <div data-vc-chart-tooltip-label>{label}</div>}<dl>{items.map((item) => <div key={item.id}>{item.color && <span aria-hidden="true" style={{ backgroundColor: item.color }} data-vc-chart-tooltip-swatch />}<dt>{item.label}</dt><dd>{item.value}</dd></div>)}</dl></div>;
}
