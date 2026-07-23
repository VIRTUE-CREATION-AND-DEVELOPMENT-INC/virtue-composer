"use client";

import { useMemo, useState } from "react";
import { FacetFilter, InlineMessage, ListView, MasterDetailLayout, SearchInput, Section } from "@/components/composer";
import styles from "./compositions.module.css";

export default function FilteredResultsMasterDetail({
  eyebrow = "Directory",
  title = "Find the right result",
  description,
  facets = [],
  results = [],
  selected,
  id = "filtered-results",
}) {
  const titleId = `${id}-title`;
  const [query, setQuery] = useState("");
  const [selectedFacets, setSelectedFacets] = useState(() => Object.fromEntries(facets.map((facet) => [facet.id, facet.defaultValue ?? []])));
  const visibleResults = useMemo(() => results.filter((result) => {
    const normalized = query.trim().toLowerCase();
    const matchesQuery = !normalized || [result.title, result.description, result.metadata, result.detail].filter(Boolean).join(" ").toLowerCase().includes(normalized);
    const matchesFacets = facets.every((facet) => {
      const selectedValues = selectedFacets[facet.id] ?? [];
      return selectedValues.length === 0 || selectedValues.some((value) => result.facets?.[facet.id]?.includes(value));
    });
    return matchesQuery && matchesFacets;
  }), [facets, query, results, selectedFacets]);
  const active = selected ?? visibleResults[0];
  return (
    <Section as="section" className={styles.section} aria-labelledby={titleId}>
      <Section as="header" className={styles.intro}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h2 id={titleId}>{title}</h2>
        {description ? <p>{description}</p> : null}
      </Section>
      <Section as="div" className={styles.searchToolbar}>
        <SearchInput className={styles.searchInput} label="Search results" placeholder="Search by name or keyword" value={query} onValueChange={setQuery} />
        <Section as="div" className={styles.facets}>
          {facets.map((facet) => <FacetFilter
            key={facet.id}
            label={facet.label}
            options={facet.options}
            value={selectedFacets[facet.id] ?? []}
            onValueChange={(values) => setSelectedFacets((current) => ({ ...current, [facet.id]: values }))}
          />)}
        </Section>
      </Section>
      <InlineMessage className={styles.resultCount}>{visibleResults.length} {visibleResults.length === 1 ? "result" : "results"}</InlineMessage>
      <MasterDetailLayout
        className={styles.masterDetail}
        master={<ListView className={styles.resultList} ariaLabel="Search results" empty="No results match the current search and filters." items={visibleResults.map((result) => ({
          id: result.id,
          title: result.title,
          description: result.description,
          metadata: result.metadata,
          href: `#${result.id}`,
        }))} />}
        detail={active ? (
          <Section as="article" className={styles.resultDetail} id={active.id}>
            <p className={styles.eyebrow}>{active.metadata}</p>
            <h3>{active.title}</h3>
            <p>{active.detail ?? active.description}</p>
          </Section>
        ) : <p>Select a result to see its details.</p>}
      />
    </Section>
  );
}
