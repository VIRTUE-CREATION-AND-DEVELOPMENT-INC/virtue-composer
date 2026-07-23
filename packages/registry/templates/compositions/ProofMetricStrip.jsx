import { Section } from "@/components/composer";
import styles from "./compositions.module.css";

export default function ProofMetricStrip({
  label = "Measured impact",
  title,
  metrics = [],
  id = "impact-metrics",
}) {
  const titleId = `${id}-title`;
  return (
    <Section as="section" className={`${styles.section} ${styles.metricSection}`} aria-labelledby={titleId}>
      <Section as="div" className={styles.metricIntro}>
        <p className={styles.eyebrow}>{label}</p>
        <h2 id={titleId}>{title ?? "Proof that the work is moving"}</h2>
      </Section>
      <dl className={styles.metrics}>
        {metrics.map((metric, index) => (
          <Section as="div" className={styles.metric} key={metric.id ?? `metric-${index + 1}`}>
            <dt>{metric.label}</dt>
            <dd>
              {metric.value}
              {metric.note ? <span className={styles.metricNote}>{metric.note}</span> : null}
            </dd>
          </Section>
        ))}
      </dl>
    </Section>
  );
}
