import { useId, type ReactNode } from "react";

export type CartSummaryRow = { id: string; label: ReactNode; value: ReactNode; tone?: "default" | "discount" };
export type CartSummaryProps = { title?: string; rows: CartSummaryRow[]; total: ReactNode; actions?: ReactNode; note?: ReactNode; className?: string };

export default function CartSummary({ title = "Order summary", rows, total, actions, note, className }: CartSummaryProps) {
  const id = useId();
  return <section aria-labelledby={id} className={className} data-vc-component="cart-summary">
    <h2 id={id}>{title}</h2>
    <dl>{rows.map((row) => <div key={row.id} data-vc-tone={row.tone}><dt>{row.label}</dt><dd>{row.value}</dd></div>)}<div data-vc-cart-total><dt>Total</dt><dd>{total}</dd></div></dl>
    {note && <div data-vc-cart-note>{note}</div>}
    {actions && <div data-vc-cart-summary-actions>{actions}</div>}
  </section>;
}
