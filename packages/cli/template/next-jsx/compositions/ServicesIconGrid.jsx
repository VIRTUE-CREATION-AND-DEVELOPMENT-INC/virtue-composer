import { ButtonLink, Section } from "@/components/composer";
import styles from "./compositions.module.css";

export default function ServicesIconGrid({
  eyebrow = "Capabilities",
  title = "Ways we can help",
  description,
  items = [],
  action,
  id = "services",
}) {
  const titleId = `${id}-title`;
  return (
    <Section as="section" className={styles.section} aria-labelledby={titleId}>
      <Section as="div" className={styles.intro}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h2 id={titleId}>{title}</h2>
        {description ? <p>{description}</p> : null}
      </Section>
      <ul className={styles.cards}>
        {items.map((item, index) => (
          <li className={styles.card} key={item.id ?? `service-${index + 1}`}>
            {item.icon ? <span className={styles.icon} aria-hidden="true">{item.icon}</span> : null}
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            {item.href ? <ButtonLink href={item.href}>{item.actionLabel ?? "Learn more"}</ButtonLink> : null}
          </li>
        ))}
      </ul>
      {action ? <div className={styles.sectionAction}><ButtonLink href={action.href}>{action.label}</ButtonLink></div> : null}
    </Section>
  );
}
