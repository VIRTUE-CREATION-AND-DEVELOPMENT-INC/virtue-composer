import { ImageGallery, Section } from "@/components/composer";
import styles from "./compositions.module.css";

export default function GalleryFeaturedGrid({
  eyebrow = "Selected work",
  title = "A closer look at the collection",
  description,
  images = [],
  id = "gallery",
}) {
  const titleId = `${id}-title`;
  return (
    <Section as="section" className={styles.section} aria-labelledby={titleId}>
      <Section as="div" className={styles.intro}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h2 id={titleId}>{title}</h2>
        {description ? <p>{description}</p> : null}
      </Section>
      <ImageGallery className={styles.gallery} images={images} ariaLabel={title} />
    </Section>
  );
}
