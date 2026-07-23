import Image from "next/image";
import { ButtonLink, Section } from "@/components/composer";
import styles from "./compositions.module.css";

function StoryCard({ story, featured = false }) {
  return (
    <article className={featured ? styles.featuredStory : styles.storyCard}>
      <Image className={styles.storyMedia} src={story.image.src} alt={story.image.alt} width={story.image.width ?? 1200} height={story.image.height ?? 800} />
      <Section as="div" className={styles.cardBody}>
        <p className={styles.eyebrow}>{story.meta}</p>
        <h3>{story.title}</h3>
        <p>{story.description}</p>
        <ButtonLink href={story.href}>{story.actionLabel ?? "Read story"}</ButtonLink>
      </Section>
    </article>
  );
}

export default function StoriesFeaturedPlusGrid({
  eyebrow = "Stories",
  title = "Ideas and outcomes worth sharing",
  description,
  featured,
  items = [],
  id = "stories",
}) {
  const titleId = `${id}-title`;
  return (
    <Section as="section" className={styles.section} aria-labelledby={titleId}>
      <Section as="div" className={styles.intro}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h2 id={titleId}>{title}</h2>
        {description ? <p>{description}</p> : null}
      </Section>
      {featured ? <StoryCard story={featured} featured /> : null}
      <Section as="div" className={styles.storyGrid}>
        {items.map((story, index) => <StoryCard story={story} key={story.id ?? `story-${index + 1}`} />)}
      </Section>
    </Section>
  );
}
