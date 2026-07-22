import Link from "next/link";
import type { ReactNode } from "react";

export type StepStatus = "complete" | "current" | "upcoming" | "error";
export type StepperItem = { id: string; label: ReactNode; description?: ReactNode; status?: StepStatus; href?: string; disabled?: boolean };
export type StepperProps = { items: StepperItem[]; orientation?: "horizontal" | "vertical"; ariaLabel?: string; className?: string };

export default function Stepper({ items, orientation = "horizontal", ariaLabel = "Progress", className }: StepperProps) {
  return (
    <nav aria-label={ariaLabel} className={className} data-vc-component="stepper" data-vc-slot="root" data-vc-orientation={orientation}>
      <ol aria-label={`${ariaLabel} steps`} tabIndex={orientation === "horizontal" ? 0 : undefined} data-vc-stepper-list data-vc-slot="list">{items.map((item, index) => {
        const status = item.status ?? "upcoming";
        const content = <>
          <span aria-hidden="true" data-vc-stepper-marker data-vc-slot="marker">{index + 1}</span>
          <span data-vc-stepper-copy data-vc-slot="copy">
            <span data-vc-stepper-label data-vc-slot="label">{item.label}</span>
            {item.description && <small data-vc-stepper-description data-vc-slot="description">{item.description}</small>}
          </span>
        </>;
        return <li key={item.id} data-vc-stepper-item data-vc-slot="item" data-vc-status={status} data-vc-index={index + 1}>
          {index < items.length - 1 && <span aria-hidden="true" data-vc-stepper-connector data-vc-slot="connector" />}
          {item.href && !item.disabled
            ? <Link href={item.href} aria-current={status === "current" ? "step" : undefined} data-vc-stepper-control data-vc-slot="control">{content}</Link>
            : <div aria-current={status === "current" ? "step" : undefined} aria-disabled={item.disabled || undefined} data-vc-stepper-control data-vc-slot="control">{content}</div>}
        </li>;
      })}</ol>
    </nav>
  );
}
