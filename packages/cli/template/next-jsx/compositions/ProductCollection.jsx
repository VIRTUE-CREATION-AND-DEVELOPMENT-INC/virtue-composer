import Image from "next/image";
import { ButtonLink, Money, Section } from "@/components/composer";
import styles from "./compositions.module.css";

export default function ProductCollection({
  eyebrow = "Collection",
  title = "Shop the collection",
  description,
  products = [],
  id = "product-collection",
}) {
  const titleId = `${id}-title`;
  return (
    <Section as="section" className={styles.section} aria-labelledby={titleId}>
      <Section as="header" className={styles.intro}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h2 id={titleId}>{title}</h2>
        {description ? <p>{description}</p> : null}
      </Section>
      <ul className={styles.productGrid}>
        {products.map((product) => (
          <li className={styles.productCard} key={product.id}>
            {product.image ? <Image className={styles.productImage} src={product.image.src} alt={product.image.alt} width={product.image.width ?? 800} height={product.image.height ?? 960} /> : null}
            <Section as="div" className={styles.productCopy}>
              {product.badge ? <p className={styles.eyebrow}>{product.badge}</p> : null}
              <h3>{product.name}</h3>
              {product.description ? <p>{product.description}</p> : null}
              <Money valueMinor={product.priceMinor} currency={product.currency ?? "USD"} />
              <ButtonLink href={product.href}>View product</ButtonLink>
            </Section>
          </li>
        ))}
      </ul>
    </Section>
  );
}
