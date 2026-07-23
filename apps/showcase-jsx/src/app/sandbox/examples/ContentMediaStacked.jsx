import Image from "next/image";
import { ButtonLink, Section } from "@/components/composer";
import styles from "./compositions.module.css";

export default function ContentMediaStacked({
  eyebrow = "Featured",
  title = "Let the image establish the setting",
  description,
  image,
  caption,
  action,
  id = "content-media-stacked",
}) {
  const titleId = `${id}-title`;
  return (
    <Section as="section" className={`${styles.section} ${styles.contentStacked}`} aria-labelledby={titleId}>
      {image ? (
        <figure className={styles.contentFigure}>
          <Image className={styles.contentMedia} src={image.src} alt={image.alt} width={image.width ?? 1600} height={image.height ?? 900} />
          {caption ? <figcaption>{caption}</figcaption> : null}
        </figure>
      ) : null}
      <Section as="div" className={styles.contentStackedBody}>
        <Section as="div" className={styles.contentBody}>
          <p className={styles.eyebrow}>{eyebrow}</p>
          <h2 id={titleId}>{title}</h2>
          {description ? <p>{description}</p> : null}
        </Section>
        {action ? <ButtonLink href={action.href}>{action.label}</ButtonLink> : null}
      </Section>
    </Section>
  );
}
