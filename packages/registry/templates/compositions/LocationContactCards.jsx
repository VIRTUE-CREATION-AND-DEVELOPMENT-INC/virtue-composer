import { ButtonLink, Section } from "@/components/composer";
import styles from "./compositions.module.css";

export default function LocationContactCards({
  eyebrow = "Visit us",
  title = "Find the location that works for you",
  description,
  locations = [],
  id = "locations",
}) {
  const titleId = `${id}-title`;
  return (
    <Section as="section" className={styles.section} aria-labelledby={titleId}>
      <Section as="div" className={styles.intro}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h2 id={titleId}>{title}</h2>
        {description ? <p>{description}</p> : null}
      </Section>
      <ul className={styles.locationGrid}>
        {locations.map((location, index) => (
          <li className={styles.location} key={location.id ?? `location-${index + 1}`}>
            <h3>{location.name}</h3>
            <address>{location.address.map((line) => <span key={line}>{line}</span>)}</address>
            <dl>
              {location.hours.map((item) => <div key={item.label}><dt>{item.label}</dt><dd>{item.value}</dd></div>)}
            </dl>
            {location.href ? <ButtonLink href={location.href}>{location.actionLabel ?? "Get directions"}</ButtonLink> : null}
          </li>
        ))}
      </ul>
    </Section>
  );
}
