import Link from "next/link";
import type { ReactNode } from "react";

export type StepStatus = "complete" | "current" | "upcoming" | "error";
export type StepperItem = { id: string; label: ReactNode; description?: ReactNode; status?: StepStatus; href?: string; disabled?: boolean };
export type StepperProps = { items: StepperItem[]; orientation?: "horizontal" | "vertical"; ariaLabel?: string; className?: string };

export default function Stepper({ items, orientation = "horizontal", ariaLabel = "Progress", className }: StepperProps) {
  return (
    <nav aria-label={ariaLabel} className={className} data-vc-component="stepper" data-vc-orientation={orientation}>
      <ol data-vc-stepper-list>{items.map((item, index) => {
        const status = item.status ?? "upcoming";
        const content = <><span aria-hidden="true" data-vc-stepper-marker>{index + 1}</span><span data-vc-stepper-copy><span data-vc-stepper-label>{item.label}</span>{item.description && <small>{item.description}</small>}</span></>;
        return <li key={item.id} data-vc-stepper-item data-vc-status={status}>{item.href && !item.disabled ? <Link href={item.href} aria-current={status === "current" ? "step" : undefined}>{content}</Link> : <div aria-current={status === "current" ? "step" : undefined} aria-disabled={item.disabled || undefined}>{content}</div>}</li>;
      })}</ol>
    </nav>
  );
}
