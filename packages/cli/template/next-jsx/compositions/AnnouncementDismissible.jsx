import { Banner, ButtonLink } from "@/components/composer";
import styles from "./compositions.module.css";

export default function AnnouncementDismissible({
  title = "A timely update",
  message,
  action,
  tone = "info",
  dismissLabel = "Dismiss announcement",
}) {
  return (
    <Banner
      className={styles.announcement}
      title={title}
      tone={tone}
      dismissible
      dismissLabel={dismissLabel}
      actions={action ? <ButtonLink href={action.href}>{action.label}</ButtonLink> : null}
    >
      {message}
    </Banner>
  );
}
