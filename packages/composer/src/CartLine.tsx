import { useId, type ReactNode } from "react";

export type CartLineProps = { id: string; product: ReactNode; details?: ReactNode; media?: ReactNode; price: ReactNode; quantity?: ReactNode; actions?: ReactNode; status?: "ready" | "pending" | "error"; error?: ReactNode; className?: string };

export default function CartLine({ id, product, details, media, price, quantity, actions, status = "ready", error, className }: CartLineProps) {
  const headingId = useId();
  return <article className={className} aria-labelledby={headingId} aria-busy={status === "pending" || undefined} data-vc-component="cart-line" data-vc-slot="root" data-vc-status={status} data-vc-id={id}>
    {media && <div data-vc-cart-media>{media}</div>}
    <div data-vc-cart-content><h3 id={headingId}>{product}</h3>{details && <div>{details}</div>}</div>
    <div data-vc-cart-price>{price}</div>
    {quantity && <div data-vc-cart-quantity>{quantity}</div>}
    {actions && <div data-vc-cart-actions>{actions}</div>}
    {status === "pending" && <span role="status">Updating cart item</span>}
    {error && <div role="alert">{error}</div>}
  </article>;
}
