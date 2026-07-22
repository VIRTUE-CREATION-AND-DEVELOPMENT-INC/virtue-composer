import type { ReactNode } from "react";

export type DetailRow = { id: string; label: ReactNode; value: ReactNode; description?: ReactNode };
export type DetailRowsProps = { items: DetailRow[]; ariaLabel?: string; className?: string };

export default function DetailRows({ items, ariaLabel, className }: DetailRowsProps) {
  return (
    <dl aria-label={ariaLabel} className={className} data-vc-component="detail-rows" data-vc-slot="root">
      {items.map((item) => <div key={item.id} data-vc-detail-row><dt>{item.label}</dt><dd>{item.value}{item.description && <small>{item.description}</small>}</dd></div>)}
    </dl>
  );
}
