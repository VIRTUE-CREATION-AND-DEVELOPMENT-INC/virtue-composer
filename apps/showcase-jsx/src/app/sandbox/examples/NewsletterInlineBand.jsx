"use client";

import { Form, Section } from "@/components/composer";
import styles from "./compositions.module.css";

export default function NewsletterInlineBand({
  eyebrow = "Stay connected",
  title = "Useful updates, sent with intention",
  description,
  consent = "By subscribing, you agree to receive occasional updates. You can unsubscribe at any time.",
  submitLabel = "Subscribe",
  onSubmit = async () => ({ message: "Thanks for subscribing." }),
  id = "newsletter",
}) {
  const titleId = `${id}-title`;
  return (
    <Section as="section" className={`${styles.section} ${styles.newsletter}`} aria-labelledby={titleId}>
      <Section as="div" className={styles.intro}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h2 id={titleId}>{title}</h2>
        {description ? <p>{description}</p> : null}
      </Section>
      <Section as="div">
        <Form
          className={styles.newsletterForm}
          fields={[{ type: "email", name: "email", label: "Email address", placeholder: "name@example.com", required: true }]}
          onSubmit={onSubmit}
          submitLabel={submitLabel}
        />
        <p className={styles.finePrint}>{consent}</p>
      </Section>
    </Section>
  );
}
