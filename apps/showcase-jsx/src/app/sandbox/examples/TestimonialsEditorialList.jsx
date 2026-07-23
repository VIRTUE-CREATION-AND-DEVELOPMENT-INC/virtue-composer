import { Section } from "@/components/composer";
import styles from "./compositions.module.css";

export default function TestimonialsEditorialList({
  eyebrow = "What people say",
  title = "Trust built through the work",
  description,
  items = [],
  id = "testimonials",
}) {
  const titleId = `${id}-title`;
  return (
    <Section as="section" className={`${styles.section} ${styles.split}`} aria-labelledby={titleId}>
      <Section as="div" className={styles.intro}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h2 id={titleId}>{title}</h2>
        {description ? <p>{description}</p> : null}
      </Section>
      <Section as="div" className={styles.quotes}>
        {items.map((item, index) => (
          <figure className={styles.quote} key={item.id ?? `quote-${index + 1}`}>
            <blockquote>“{item.quote}”</blockquote>
            <figcaption>
              <strong>{item.name}</strong>
              <span>{item.role}</span>
              {item.outcome ? <span>{item.outcome}</span> : null}
            </figcaption>
          </figure>
        ))}
      </Section>
    </Section>
  );
}
