import { useId, type ReactNode } from "react";

export type ProgressBarProps = { value?: number; max?: number; label: ReactNode; showValue?: boolean; formatValue?: (value: number, max: number) => ReactNode; className?: string };

export default function ProgressBar({ value, max = 100, label, showValue = false, formatValue, className }: ProgressBarProps) {
  const id = useId();
  const boundedValue = value === undefined ? undefined : Math.min(Math.max(value, 0), max);
  const valueLabel = boundedValue === undefined ? "In progress" : formatValue?.(boundedValue, max) ?? `${Math.round((boundedValue / max) * 100)}%`;
  return (
    <div className={className} data-vc-component="progress-bar" data-vc-indeterminate={boundedValue === undefined || undefined}>
      <div data-vc-progress-label><label htmlFor={id}>{label}</label>{showValue && <span>{valueLabel}</span>}</div>
      <progress id={id} value={boundedValue} max={max} aria-valuetext={String(valueLabel)} />
    </div>
  );
}
