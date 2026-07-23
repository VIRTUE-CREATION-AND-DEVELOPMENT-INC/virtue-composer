import Image from "next/image";
import { ButtonLink, Section } from "@/components/composer";
import styles from "./compositions.module.css";

export default function ServicesMediaGrid({
  eyebrow = "Services",
  title = "Work shaped around the outcome",
  description,
  items = [],
  id = "services",
}) {
  const titleId = `${id}-title`;
  return (
    <Section as="section" className={styles.section} aria-labelledby={titleId}>
      <Section as="div" className={styles.intro}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h2 id={titleId}>{title}</h2>
        {description ? <p>{description}</p> : null}
      </Section>
      <Section as="div" className={styles.mediaCards}>
        {items.map((item, index) => (
          <article className={styles.mediaCard} key={item.id ?? `service-${index + 1}`}>
            <Image className={styles.media} src={item.image.src} alt={item.image.alt} width={item.image.width ?? 1200} height={item.image.height ?? 800} />
            <Section as="div" className={styles.cardBody}>
              <p className={styles.index}>{String(index + 1).padStart(2, "0")}</p>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              {item.href ? <ButtonLink href={item.href}>{item.actionLabel ?? "Explore service"}</ButtonLink> : null}
            </Section>
          </article>
        ))}
      </Section>
    </Section>
  );
}
