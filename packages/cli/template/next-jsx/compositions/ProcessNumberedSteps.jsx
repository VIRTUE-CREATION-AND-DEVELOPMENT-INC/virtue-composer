import { Section } from "@/components/composer";
import styles from "./compositions.module.css";

export default function ProcessNumberedSteps({
  eyebrow = "Process",
  title = "A clear path from idea to outcome",
  description,
  steps = [],
  id = "process",
}) {
  const titleId = `${id}-title`;
  return (
    <Section as="section" className={styles.section} aria-labelledby={titleId}>
      <Section as="div" className={styles.intro}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h2 id={titleId}>{title}</h2>
        {description ? <p>{description}</p> : null}
      </Section>
      <ol className={styles.steps}>
        {steps.map((step, index) => (
          <li className={styles.step} key={step.id ?? `step-${index + 1}`}>
            <span className={styles.stepNumber} aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
            <h3>{step.title}</h3>
            <p>{step.description}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
