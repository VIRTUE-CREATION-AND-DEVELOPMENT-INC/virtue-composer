"use client";

import { ActionGroup, Form, Section, Tabs } from "@/components/composer";
import styles from "./compositions.module.css";

export default function ResourceEditorDetail({
  eyebrow = "Resource",
  title = "Edit resource",
  description,
  fields = [],
  metadata = [],
  id = "resource-editor",
}) {
  const titleId = `${id}-title`;
  const editor = <Form className={styles.editorForm} fields={fields} submitLabel="Save changes" onSubmit={async () => ({ message: "Changes saved in this example." })} />;
  const details = (
    <dl className={styles.editorMetadata}>
      {metadata.map((item) => <div key={item.label}><dt>{item.label}</dt><dd>{item.value}</dd></div>)}
    </dl>
  );
  return (
    <Section as="section" className={styles.section} aria-labelledby={titleId}>
      <Section as="header" className={styles.resourceHeader}>
        <Section as="div" className={styles.intro}>
          <p className={styles.eyebrow}>{eyebrow}</p>
          <h2 id={titleId}>{title}</h2>
          {description ? <p>{description}</p> : null}
        </Section>
        <ActionGroup actions={[
          { id: "preview", label: "Preview", href: "#preview" },
          { id: "archive", label: "Archive" },
        ]} />
      </Section>
      <Tabs className={styles.editorTabs} ariaLabel="Resource editor sections" items={[
        { id: "content", label: "Content", content: editor },
        { id: "details", label: "Details", content: details },
      ]} />
    </Section>
  );
}
