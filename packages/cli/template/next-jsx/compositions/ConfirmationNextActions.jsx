import { ButtonLink, Section } from "@/components/composer";
import styles from "./compositions.module.css";

export default function ConfirmationNextActions({
  eyebrow = "Complete",
  title = "Your request is on its way",
  description,
  reference,
  actions = [],
  id = "confirmation",
}) {
  const titleId = `${id}-title`;
  return (
    <Section as="section" className={`${styles.section} ${styles.confirmation}`} aria-labelledby={titleId} role="status">
      <span className={styles.confirmationMark} aria-hidden="true">✓</span>
      <p className={styles.eyebrow}>{eyebrow}</p>
      <h2 id={titleId}>{title}</h2>
      {description ? <p>{description}</p> : null}
      {reference ? <p className={styles.reference}>Reference: <strong>{reference}</strong></p> : null}
      <Section as="div" className={styles.actions}>
        {actions.map((action) => <ButtonLink href={action.href} key={action.href}>{action.label}</ButtonLink>)}
      </Section>
    </Section>
  );
}
