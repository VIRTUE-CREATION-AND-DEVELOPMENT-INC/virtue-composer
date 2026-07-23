"use client";

import { Money, SelectableCardGroup, Section, Wizard } from "@/components/composer";
import styles from "./compositions.module.css";

export default function EstimateFlow({
  eyebrow = "Estimate",
  title = "Build a working estimate",
  description,
  serviceOptions = [],
  timingOptions = [],
  estimate = { minimumMinor: 0, maximumMinor: 0, currency: "USD" },
  id = "estimate-flow",
}) {
  const titleId = `${id}-title`;
  const steps = [
    {
      id: "scope",
      title: "Scope",
      description: "Choose the work",
      content: <SelectableCardGroup className={styles.selectionGroup} label="What do you need?" items={serviceOptions} type="multiple" defaultValue={[]} />,
    },
    {
      id: "timing",
      title: "Timing",
      description: "Choose a pace",
      content: <SelectableCardGroup className={styles.selectionGroup} label="When should it be ready?" items={timingOptions} defaultValue="" required />,
    },
    {
      id: "estimate",
      title: "Estimate",
      description: "Review the range",
      content: (
        <Section as="div" className={styles.estimateResult}>
          <p className={styles.eyebrow}>Working range</p>
          <p className={styles.estimateValue}>
            <Money valueMinor={estimate.minimumMinor} rangeEndMinor={estimate.maximumMinor} currency={estimate.currency ?? "USD"} />
          </p>
          <p>This range is a planning baseline. Final scope follows a short review.</p>
        </Section>
      ),
    },
  ];
  return (
    <Section as="section" className={styles.section} aria-labelledby={titleId}>
      <Section as="header" className={styles.intro}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h2 id={titleId}>{title}</h2>
        {description ? <p>{description}</p> : null}
      </Section>
      <Wizard className={styles.wizard} steps={steps} completeLabel="Request this estimate" />
    </Section>
  );
}
