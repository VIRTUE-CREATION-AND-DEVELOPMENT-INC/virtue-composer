"use client";

import { ButtonLink, Form, Section } from "@/components/composer";
import styles from "./compositions.module.css";

const defaultFields = [
  { type: "text", name: "name", label: "Name", required: true, placeholder: "Your name" },
  { type: "email", name: "email", label: "Email address", required: true, placeholder: "name@example.com" },
  { type: "select", name: "topic", label: "What can we help with?", placeholder: "Choose a topic", options: [
    { value: "project", label: "Start a project" },
    { value: "support", label: "Project support" },
    { value: "other", label: "Something else" },
  ] },
  { type: "textarea", name: "message", label: "Message", required: true, rows: 5, placeholder: "Tell us what you are working on" },
];

export default function ContactFormSplit({
  eyebrow = "Contact",
  title = "Tell us what you need",
  description,
  contactMethods = [],
  fields = defaultFields,
  submitLabel = "Send inquiry",
  onSubmit = async () => ({ message: "Thanks. Your inquiry has been received." }),
  id = "contact",
}) {
  const titleId = `${id}-title`;
  return (
    <Section as="section" className={`${styles.section} ${styles.contactSplit}`} aria-labelledby={titleId}>
      <Section as="div" className={styles.contactIntro}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h2 id={titleId}>{title}</h2>
        {description ? <p>{description}</p> : null}
        {contactMethods.length ? (
          <ul className={styles.contactMethods}>
            {contactMethods.map((method) => (
              <li key={method.href}>
                <span>{method.label}</span>
                <ButtonLink href={method.href}>{method.value}</ButtonLink>
              </li>
            ))}
          </ul>
        ) : null}
      </Section>
      <Form className={styles.contactForm} fields={fields} onSubmit={onSubmit} submitLabel={submitLabel} />
    </Section>
  );
}
