"use client";

import { Button, ImageGallery, Money, ProductOptionSelect, QuantityInput, Section } from "@/components/composer";
import styles from "./compositions.module.css";

export default function ProductDetailGallery({
  eyebrow = "Product",
  title = "Product name",
  description,
  priceMinor = 0,
  currency = "USD",
  images = [],
  options = [],
  id = "product-detail",
}) {
  const titleId = `${id}-title`;
  return (
    <Section as="section" className={`${styles.section} ${styles.productDetail}`} aria-labelledby={titleId}>
      <ImageGallery className={styles.gallery} images={images} ariaLabel={`${title} product images`} />
      <Section as="div" className={styles.productPanel}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h2 id={titleId}>{title}</h2>
        <Money className={styles.productPrice} valueMinor={priceMinor} currency={currency} />
        {description ? <p>{description}</p> : null}
        {options.length ? <ProductOptionSelect className={styles.optionSelect} label="Choose an option" options={options} defaultValue={options.find((option) => option.available !== false)?.value} required /> : null}
        <QuantityInput className={styles.quantity} label="Quantity" max={10} />
        <Button className={styles.primaryButton}>Add to cart</Button>
      </Section>
    </Section>
  );
}
