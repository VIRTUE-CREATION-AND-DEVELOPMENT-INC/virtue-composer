"use client";

import { ButtonLink, Form, Section } from "@/components/composer";
import styles from "./compositions.module.css";

export default function AuthShell({
  eyebrow = "Account",
  title = "Sign in",
  description = "Use your account details to continue.",
  alternate = { label: "Create an account", href: "#create-account" },
  support = { label: "Forgot your password?", href: "#reset-password" },
  id = "auth-shell",
}) {
  const titleId = `${id}-title`;
  return (
    <Section as="section" className={`${styles.section} ${styles.authShell}`} aria-labelledby={titleId}>
      <Section as="div" className={styles.authPanel}>
        <Section as="header" className={styles.intro}>
          <p className={styles.eyebrow}>{eyebrow}</p>
          <h2 id={titleId}>{title}</h2>
          <p>{description}</p>
        </Section>
        <Form
          className={styles.authForm}
          fields={[
            { type: "email", name: "email", label: "Email address", required: true, autoComplete: "email" },
            { type: "password", name: "password", label: "Password", required: true },
          ]}
          submitLabel="Sign in"
          onSubmit={async () => ({ message: "Signed-in state belongs to the consuming project." })}
        />
        <Section as="nav" className={styles.authLinks} aria-label="Account help">
          <ButtonLink href={support.href}>{support.label}</ButtonLink>
          <ButtonLink href={alternate.href}>{alternate.label}</ButtonLink>
        </Section>
      </Section>
    </Section>
  );
}
