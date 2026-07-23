"use client";

import { SelectableCardGroup, Section, Wizard } from "@/components/composer";
import styles from "./compositions.module.css";

export default function MultiStepSelectionFlow({
  eyebrow = "Guided selection",
  title = "Find the right starting point",
  description,
  steps = [],
  id = "selection-flow",
}) {
  const titleId = `${id}-title`;
  const wizardSteps = steps.map((step) => ({
    id: step.id,
    title: step.title,
    description: step.description,
    content: (
      <SelectableCardGroup
        className={styles.selectionGroup}
        label={step.prompt}
        description={step.help}
        items={step.options}
        type={step.multiple ? "multiple" : "single"}
        defaultValue={step.multiple ? [] : ""}
        required={!step.multiple}
      />
    ),
  }));
  return (
    <Section as="section" className={styles.section} aria-labelledby={titleId}>
      <Section as="header" className={styles.intro}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h2 id={titleId}>{title}</h2>
        {description ? <p>{description}</p> : null}
      </Section>
      <Wizard className={styles.wizard} steps={wizardSteps} completeLabel="See recommendation" />
    </Section>
  );
}
