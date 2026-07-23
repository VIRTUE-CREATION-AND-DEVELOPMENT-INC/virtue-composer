import { Section } from "@/components/composer";
import styles from "./compositions.module.css";

export default function FAQStackedList({
  eyebrow = "Questions",
  title = "Answers at a glance",
  description,
  items = [],
  id = "answers-at-a-glance",
}) {
  const titleId = `${id}-title`;
  return (
    <Section as="section" className={styles.section} aria-labelledby={titleId}>
      <Section as="div" className={styles.intro}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h2 id={titleId}>{title}</h2>
        {description ? <p>{description}</p> : null}
      </Section>
      <dl className={styles.definitionList}>
        {items.map((item, index) => (
          <Section as="div" className={styles.definitionItem} key={item.id ?? `answer-${index + 1}`}>
            <dt>{item.question}</dt>
            <dd>{item.answer}</dd>
          </Section>
        ))}
      </dl>
    </Section>
  );
}
