import Image from "next/image";
import { Section } from "@/components/composer";
import styles from "./compositions.module.css";

export default function PeopleProfileGrid({
  eyebrow = "People",
  title = "Meet the people behind the work",
  description,
  people = [],
  id = "people",
}) {
  const titleId = `${id}-title`;
  return (
    <Section as="section" className={styles.section} aria-labelledby={titleId}>
      <Section as="div" className={styles.intro}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h2 id={titleId}>{title}</h2>
        {description ? <p>{description}</p> : null}
      </Section>
      <ul className={styles.peopleGrid}>
        {people.map((person, index) => (
          <li className={styles.person} key={person.id ?? `person-${index + 1}`}>
            {person.image ? <Image className={styles.portrait} src={person.image.src} alt={person.image.alt} width={person.image.width ?? 720} height={person.image.height ?? 900} /> : <div className={styles.portraitPlaceholder} aria-hidden="true" />}
            <h3>{person.name}</h3>
            <p className={styles.role}>{person.role}</p>
            {person.bio ? <p>{person.bio}</p> : null}
          </li>
        ))}
      </ul>
    </Section>
  );
}
