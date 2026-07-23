import { ButtonLink, Section } from "@/components/composer";
import styles from "./compositions.module.css";

function EventDetails({ event }) {
  return (
    <>
      <time dateTime={event.dateTime}>{event.dateLabel}</time>
      <h3>{event.title}</h3>
      <p>{event.description}</p>
      <p className={styles.eventMeta}>{event.timeLabel} · {event.location}</p>
      {event.href ? <ButtonLink href={event.href}>{event.actionLabel ?? "View event"}</ButtonLink> : null}
    </>
  );
}

export default function EventsFeaturedList({
  eyebrow = "Events",
  title = "Find your next moment to join in",
  description,
  featured,
  upcoming = [],
  id = "events",
}) {
  const titleId = `${id}-title`;
  return (
    <Section as="section" className={styles.section} aria-labelledby={titleId}>
      <Section as="div" className={styles.intro}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h2 id={titleId}>{title}</h2>
        {description ? <p>{description}</p> : null}
      </Section>
      <Section as="div" className={styles.eventLayout}>
        {featured ? <article className={styles.featuredEvent}><EventDetails event={featured} /></article> : null}
        <Section as="div" className={styles.eventList}>
          {upcoming.map((event, index) => <article className={styles.eventItem} key={event.id ?? `event-${index + 1}`}><EventDetails event={event} /></article>)}
        </Section>
      </Section>
    </Section>
  );
}
