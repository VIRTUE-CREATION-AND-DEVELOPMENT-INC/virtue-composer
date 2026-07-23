import Image from "next/image";
import { Section } from "@/components/composer";
import styles from "./compositions.module.css";

export default function TimelineAlternatingMedia({
  eyebrow = "Our journey",
  title = "Progress built one milestone at a time",
  description,
  entries = [],
  id = "timeline",
}) {
  const titleId = `${id}-title`;
  return (
    <Section as="section" className={styles.section} aria-labelledby={titleId}>
      <Section as="div" className={styles.intro}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h2 id={titleId}>{title}</h2>
        {description ? <p>{description}</p> : null}
      </Section>
      <ol className={styles.timeline}>
        {entries.map((entry, index) => (
          <li className={styles.timelineEntry} key={entry.id ?? `milestone-${index + 1}`}>
            {entry.image ? <Image className={styles.timelineMedia} src={entry.image.src} alt={entry.image.alt} width={entry.image.width ?? 1200} height={entry.image.height ?? 800} /> : <div className={styles.mediaPlaceholder} aria-hidden="true" />}
            <Section as="div" className={styles.timelineCopy}>
              <p className={styles.eyebrow}>{entry.label}</p>
              <h3>{entry.title}</h3>
              <p>{entry.description}</p>
            </Section>
          </li>
        ))}
      </ol>
    </Section>
  );
}
