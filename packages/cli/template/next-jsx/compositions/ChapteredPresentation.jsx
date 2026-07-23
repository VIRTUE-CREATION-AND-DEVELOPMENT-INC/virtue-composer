import Image from "next/image";
import { AnchorNav, Section } from "@/components/composer";
import styles from "./compositions.module.css";

export default function ChapteredPresentation({
  eyebrow = "Presentation",
  title = "Move through the story by chapter",
  description,
  chapters = [],
  id = "chaptered-presentation",
}) {
  const titleId = `${id}-title`;
  return (
    <Section as="section" className={`${styles.section} ${styles.presentation}`} aria-labelledby={titleId}>
      <Section as="header" className={styles.intro}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h2 id={titleId}>{title}</h2>
        {description ? <p>{description}</p> : null}
      </Section>
      <AnchorNav className={styles.chapterNav} ariaLabel="Presentation chapters" items={chapters.map((chapter, index) => ({
        id: chapter.id,
        label: `${String(index + 1).padStart(2, "0")} ${chapter.title}`,
        href: `#${id}-${chapter.id}`,
      }))} />
      <Section as="div" className={styles.presentationChapters}>
        {chapters.map((chapter, index) => (
          <Section as="article" className={styles.presentationChapter} id={`${id}-${chapter.id}`} key={chapter.id}>
            <Section as="div" className={styles.chapterCopy}>
              <p className={styles.index}>{String(index + 1).padStart(2, "0")}</p>
              <h3>{chapter.title}</h3>
              <p>{chapter.description}</p>
            </Section>
            {chapter.image ? <Image className={styles.presentationImage} src={chapter.image.src} alt={chapter.image.alt} width={chapter.image.width ?? 1200} height={chapter.image.height ?? 800} /> : null}
          </Section>
        ))}
      </Section>
    </Section>
  );
}
