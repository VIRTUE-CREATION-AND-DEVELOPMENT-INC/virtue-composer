"use client";

import { useMemo, useState } from "react";
import {
  Badge,
  ButtonLink,
  Field,
  Input,
  Section,
  SegmentedControl,
  Select,
} from "@/components/composer";
import { compositionExamples } from "./examples";
import { sampleProps } from "./sample-data";
import styles from "./sandbox.module.css";

const packNames = {
  core: "Core",
  commerce: "Commerce",
  "guided-workflows": "Guided workflows",
  search: "Search",
  application: "Application",
  immersive: "Immersive",
};

function Example({ composition, instance }) {
  const Component = compositionExamples[composition.id];
  return <Component {...sampleProps[composition.id]} id={`${instance}-${composition.id}`} />;
}

function CompositionCard({ composition }) {
  return (
    <Section as="article" className={styles.catalogCard} aria-labelledby={`${composition.id}-catalog-title`}>
      <Section as="header" className={styles.cardHeader} layout="flex" justify="between" align="start" gap="medium" wrap>
        <Section as="div" layout="grid" gap="small">
          <p className={styles.kicker}>{packNames[composition.pack ?? "core"]} · {composition.family}</p>
          <h2 id={`${composition.id}-catalog-title`}>{composition.title}</h2>
          <p>{composition.selection.description}</p>
        </Section>
        <Badge tone="info">{composition.stability}</Badge>
      </Section>
      <Section as="div" className={styles.preview} layout="grid">
        <Example composition={composition} instance="catalog" />
      </Section>
      <details className={styles.details}>
        <summary>Selection and anatomy</summary>
        <Section as="div" className={styles.detailGrid} layout="grid" columns={2} gap="large">
          <Section as="div" layout="grid" gap="small">
            <h3>Choose when</h3>
            <ul>{composition.selection.queries.map((query) => <li key={query}>{query}</li>)}</ul>
            <h3>Avoid when</h3>
            <ul>{composition.selection.avoidWhen.map((reason) => <li key={reason}>{reason}</li>)}</ul>
          </Section>
          <Section as="div" layout="grid" gap="small">
            <h3>Anatomy</h3>
            <ul>{composition.anatomy.map((slot) => <li key={slot.id}>{slot.label}{slot.required ? " · required" : " · optional"}</li>)}</ul>
            <h3>Composer components</h3>
            <p>{composition.components.join(", ")}</p>
          </Section>
        </Section>
      </details>
      <code className={styles.command} tabIndex={0}>
        virtue-composer compose . --compositions={composition.id}
      </code>
    </Section>
  );
}

function BlueprintCard({ blueprint, compositionMap }) {
  return (
    <Section as="article" className={styles.blueprintCard} aria-labelledby={`${blueprint.id}-title`}>
      <Section as="header" className={styles.cardHeader} layout="flex" justify="between" align="start" gap="medium" wrap>
        <Section as="div" layout="grid" gap="small">
          <p className={styles.kicker}>Page blueprint</p>
          <h2 id={`${blueprint.id}-title`}>{blueprint.title}</h2>
          <p>{blueprint.selection.description}</p>
        </Section>
        <Badge tone="info">{blueprint.sequence.length} sections</Badge>
      </Section>
      <ol className={styles.sequence}>
        {blueprint.sequence.map((id, index) => <li key={id}><span>{String(index + 1).padStart(2, "0")}</span>{compositionMap.get(id)?.title}</li>)}
      </ol>
      <Section as="div" className={styles.blueprintPreview} layout="grid" gap="large">
        {blueprint.sequence.map((id) => {
          const composition = compositionMap.get(id);
          return composition ? <Example composition={composition} instance={blueprint.id} key={id} /> : null;
        })}
      </Section>
      <code className={styles.command} tabIndex={0}>
        virtue-composer compose . --blueprint={blueprint.id}
      </code>
    </Section>
  );
}

export default function CompositionSandbox({ compositions, blueprints }) {
  const [view, setView] = useState("compositions");
  const [query, setQuery] = useState("");
  const [family, setFamily] = useState("all");
  const [pack, setPack] = useState("all");
  const normalized = query.trim().toLowerCase();
  const compositionMap = useMemo(() => new Map(compositions.map((composition) => [composition.id, composition])), [compositions]);
  const families = useMemo(() => ["all", ...new Set(compositions.map((composition) => composition.family))], [compositions]);
  const packs = useMemo(() => ["all", ...new Set(compositions.map((composition) => composition.pack ?? "core"))], [compositions]);
  const visibleCompositions = compositions.filter((composition) => {
    const resolvedPack = composition.pack ?? "core";
    const haystack = [composition.id, composition.title, composition.family, resolvedPack, composition.description, composition.selection.description, ...composition.selection.queries, ...composition.selection.keywords].join(" ").toLowerCase();
    return (pack === "all" || resolvedPack === pack) && (family === "all" || composition.family === family) && (!normalized || haystack.includes(normalized));
  });
  const visibleBlueprints = blueprints.filter((blueprint) => {
    const haystack = [blueprint.id, blueprint.title, blueprint.description, blueprint.selection.description, ...blueprint.selection.queries, ...blueprint.selection.keywords].join(" ").toLowerCase();
    return !normalized || haystack.includes(normalized);
  });

  return (
    <Section as="main" className={styles.page} id="catalog">
      <Section as="header" className={styles.hero} layout="grid" gap="large">
        <Section as="div" layout="grid" gap="small">
          <p className={styles.kicker}>Virtue Composer 0.6</p>
          <h1>Composition sandbox</h1>
          <p>Search adaptable wireframes, inspect their selection contract, and copy the same project-owned JSX and CSS shown in each preview.</p>
        </Section>
        <ButtonLink href="/">Return to component workbench</ButtonLink>
      </Section>

      <Section as="section" className={styles.controls} aria-label="Sandbox controls" layout="grid" gap="medium">
        <SegmentedControl
          ariaLabel="Catalog view"
          value={view}
          onValueChange={(value) => value && setView(value)}
          items={[
            { value: "compositions", label: `Compositions (${compositions.length})` },
            { value: "blueprints", label: `Blueprints (${blueprints.length})` },
          ]}
        />
        <Section as="div" className={styles.filterGrid} layout="grid" columns={3} gap="medium">
          <Field label="Search catalog">
            <Input type="search" value={query} onChange={(event) => setQuery(event.currentTarget.value)} placeholder="Try testimonials, nonprofit, locations…" />
          </Field>
          <Field label="Composition pack">
            <Select value={pack} onChange={(event) => { setPack(event.currentTarget.value); setFamily("all"); }} disabled={view === "blueprints"}>
              {packs.map((name) => <option value={name} key={name}>{name === "all" ? "All packs" : packNames[name]}</option>)}
            </Select>
          </Field>
          <Field label="Composition family">
            <Select value={family} onChange={(event) => setFamily(event.currentTarget.value)} disabled={view === "blueprints"}>
              {families.map((name) => <option value={name} key={name}>{name === "all" ? "All families" : name}</option>)}
            </Select>
          </Field>
        </Section>
        <p aria-live="polite">{view === "compositions" ? `${visibleCompositions.length} compositions` : `${visibleBlueprints.length} blueprints`} match the current filters.</p>
      </Section>

      {view === "compositions" ? (
        <Section as="section" className={styles.catalog} aria-label="Composition catalog" layout="grid" gap="large">
          {visibleCompositions.map((composition) => <CompositionCard composition={composition} key={composition.id} />)}
          {visibleCompositions.length === 0 ? <p>No compositions match this search.</p> : null}
        </Section>
      ) : (
        <Section as="section" className={styles.catalog} aria-label="Page blueprint catalog" layout="grid" gap="large">
          {visibleBlueprints.map((blueprint) => <BlueprintCard blueprint={blueprint} compositionMap={compositionMap} key={blueprint.id} />)}
          {visibleBlueprints.length === 0 ? <p>No blueprints match this search.</p> : null}
        </Section>
      )}
    </Section>
  );
}
