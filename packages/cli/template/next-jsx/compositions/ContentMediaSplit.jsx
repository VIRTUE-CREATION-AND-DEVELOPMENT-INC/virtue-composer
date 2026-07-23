import Image from "next/image";
import { ButtonLink, Section } from "@/components/composer";
import styles from "./compositions.module.css";

export default function ContentMediaSplit({
  eyebrow = "Our approach",
  title = "Pair the message with useful context",
  description,
  image,
  caption,
  action,
  mediaPosition = "end",
  id = "content-media",
}) {
  const titleId = `${id}-title`;
  const className = mediaPosition === "start" ? `${styles.section} ${styles.contentSplit} ${styles.mediaStart}` : `${styles.section} ${styles.contentSplit}`;
  return (
    <Section as="section" className={className} aria-labelledby={titleId}>
      <Section as="div" className={styles.contentBody}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h2 id={titleId}>{title}</h2>
        {description ? <p>{description}</p> : null}
        {action ? <ButtonLink href={action.href}>{action.label}</ButtonLink> : null}
      </Section>
      {image ? (
        <figure className={styles.contentFigure}>
          <Image className={styles.contentMedia} src={image.src} alt={image.alt} width={image.width ?? 1200} height={image.height ?? 800} />
          {caption ? <figcaption>{caption}</figcaption> : null}
        </figure>
      ) : null}
    </Section>
  );
}
