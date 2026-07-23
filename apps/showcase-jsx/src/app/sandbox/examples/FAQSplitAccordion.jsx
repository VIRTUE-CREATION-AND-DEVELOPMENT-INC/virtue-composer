import { Accordion, ButtonLink, Section } from "@/components/composer";
import styles from "./compositions.module.css";

export default function FAQSplitAccordion({
  eyebrow = "Questions",
  title = "What people ask before getting started",
  description,
  items = [],
  supportAction,
  id = "frequently-asked-questions",
}) {
  const titleId = `${id}-title`;
  return (
    <Section as="section" className={`${styles.section} ${styles.split}`} aria-labelledby={titleId}>
      <Section as="div" className={styles.intro}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h2 id={titleId}>{title}</h2>
        {description ? <p>{description}</p> : null}
        {supportAction ? <ButtonLink href={supportAction.href}>{supportAction.label}</ButtonLink> : null}
      </Section>
      <Accordion
        className={styles.accordion}
        type="single"
        items={items.map((item, index) => ({
          id: item.id ?? `question-${index + 1}`,
          title: item.question,
          content: <p>{item.answer}</p>,
        }))}
      />
    </Section>
  );
}
