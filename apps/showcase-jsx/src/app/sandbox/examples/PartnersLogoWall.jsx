import { ButtonLink, Section } from "@/components/composer";
import styles from "./compositions.module.css";

export default function PartnersLogoWall({
  eyebrow = "In good company",
  title = "Partners who strengthen the work",
  description,
  items = [],
  id = "partners",
}) {
  const titleId = `${id}-title`;
  return (
    <Section as="section" className={styles.section} aria-labelledby={titleId}>
      <Section as="div" className={styles.intro}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h2 id={titleId}>{title}</h2>
        {description ? <p>{description}</p> : null}
      </Section>
      <ul className={styles.logoWall}>
        {items.map((item, index) => (
          <li className={styles.logoCell} key={item.id ?? `partner-${index + 1}`}>
            {item.href ? <ButtonLink href={item.href} aria-label={`Visit ${item.name}`}>{item.mark ?? item.name}</ButtonLink> : <span>{item.mark ?? item.name}</span>}
          </li>
        ))}
      </ul>
    </Section>
  );
}
