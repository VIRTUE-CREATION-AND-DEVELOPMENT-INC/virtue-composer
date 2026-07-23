"use client";

import Image from "next/image";
import { Button, ButtonLink, CartLine, CartSummary, DiscountCodeInput, Money, QuantityInput, Section } from "@/components/composer";
import styles from "./compositions.module.css";

export default function CartCheckoutSummary({
  title = "Your cart",
  items = [],
  rows = [],
  totalMinor = 0,
  currency = "USD",
  checkoutHref = "#checkout",
  id = "cart",
}) {
  const titleId = `${id}-title`;
  return (
    <Section as="section" className={`${styles.section} ${styles.cartLayout}`} aria-labelledby={titleId}>
      <Section as="div" className={styles.cartItems}>
        <h2 id={titleId}>{title}</h2>
        {items.map((item) => (
          <CartLine
            className={styles.cartLine}
            id={item.id}
            key={item.id}
            product={item.name}
            details={item.details}
            media={item.image ? <Image src={item.image.src} alt={item.image.alt} width={120} height={120} /> : null}
            price={<Money valueMinor={item.priceMinor} currency={currency} />}
            quantity={<QuantityInput label={`${item.name} quantity`} defaultValue={item.quantity ?? 1} max={10} allowRemove />}
            actions={<Button>Save for later</Button>}
          />
        ))}
      </Section>
      <Section as="aside" className={styles.summaryPanel}>
        <DiscountCodeInput className={styles.discount} label="Discount code" onApply={() => {}} />
        <CartSummary
          className={styles.cartSummary}
          rows={rows.map((row) => ({ ...row, value: <Money valueMinor={row.valueMinor} currency={currency} /> }))}
          total={<Money valueMinor={totalMinor} currency={currency} />}
          actions={<ButtonLink href={checkoutHref}>Continue to checkout</ButtonLink>}
          note="Taxes and shipping are calculated at checkout."
        />
      </Section>
    </Section>
  );
}
