import Image from "next/image";
import { Section } from "@/components/composer";
import styles from "./compositions.module.css";

export default function HorizontalStory({
  eyebrow = "Story",
  title = "A story told in scenes",
  description,
  chapters = [],
  id = "horizontal-story",
}) {
  const titleId = `${id}-title`;
  return (
    <Section as="section" className={`${styles.section} ${styles.horizontalSection}`} aria-labelledby={titleId}>
      <Section as="header" className={styles.intro}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h2 id={titleId}>{title}</h2>
        {description ? <p>{description}</p> : null}
      </Section>
      <ol className={styles.horizontalStory} aria-label={`${title} chapters`} tabIndex={0}>
        {chapters.map((chapter, index) => (
          <li className={styles.horizontalChapter} key={chapter.id}>
            {chapter.image ? <Image className={styles.horizontalImage} src={chapter.image.src} alt={chapter.image.alt} width={chapter.image.width ?? 1200} height={chapter.image.height ?? 800} /> : null}
            <Section as="div" className={styles.chapterCopy}>
              <p className={styles.index}>{String(index + 1).padStart(2, "0")}</p>
              <h3>{chapter.title}</h3>
              <p>{chapter.description}</p>
            </Section>
          </li>
        ))}
      </ol>
    </Section>
  );
}
