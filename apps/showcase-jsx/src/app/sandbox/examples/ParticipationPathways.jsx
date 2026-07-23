import { ButtonLink, Section } from "@/components/composer";
import styles from "./compositions.module.css";

export default function ParticipationPathways({
  eyebrow = "Take part",
  title = "Choose how you want to make a difference",
  description,
  pathways = [],
  id = "get-involved",
}) {
  const titleId = `${id}-title`;
  return (
    <Section as="section" className={styles.section} aria-labelledby={titleId}>
      <Section as="div" className={styles.intro}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h2 id={titleId}>{title}</h2>
        {description ? <p>{description}</p> : null}
      </Section>
      <ul className={styles.pathways}>
        {pathways.map((pathway, index) => (
          <li className={styles.pathway} key={pathway.id ?? `pathway-${index + 1}`}>
            <p className={styles.index}>{String(index + 1).padStart(2, "0")}</p>
            <h3>{pathway.title}</h3>
            <p>{pathway.description}</p>
            <ButtonLink href={pathway.href}>{pathway.actionLabel}</ButtonLink>
          </li>
        ))}
      </ul>
    </Section>
  );
}
