"use client";

import { useState } from "react";
import { ButtonLink, DataGrid, SearchInput, Section } from "@/components/composer";
import styles from "./compositions.module.css";

const columns = [
  { id: "name", header: "Name", accessorKey: "name", sortable: true, size: 220 },
  { id: "type", header: "Type", accessorKey: "type", sortable: true, size: 140 },
  { id: "status", header: "Status", accessorKey: "status", sortable: true, size: 140 },
  { id: "updated", header: "Updated", accessorKey: "updated", sortable: true, size: 150 },
];

export default function ResourceIndex({
  eyebrow = "Resources",
  title = "Manage resources",
  description,
  rows = [],
  createAction = { label: "Create resource", href: "#new-resource" },
  id = "resource-index",
}) {
  const titleId = `${id}-title`;
  const [query, setQuery] = useState("");
  return (
    <Section as="section" className={styles.section} aria-labelledby={titleId}>
      <Section as="header" className={styles.resourceHeader}>
        <Section as="div" className={styles.intro}>
          <p className={styles.eyebrow}>{eyebrow}</p>
          <h2 id={titleId}>{title}</h2>
          {description ? <p>{description}</p> : null}
        </Section>
        <ButtonLink href={createAction.href}>{createAction.label}</ButtonLink>
      </Section>
      <SearchInput className={styles.searchInput} label="Search resources" placeholder="Search resources" value={query} onValueChange={setQuery} />
      <DataGrid className={styles.dataGrid} rows={rows} columns={columns} caption="Resources" selectable defaultSorting={[{ id: "updated", desc: true }]} globalFilter={query} onGlobalFilterChange={setQuery} empty="No resources match the current filters." />
    </Section>
  );
}
