# Virtue Composer roadmap

Composer grows from observed project needs. The package owns reusable structure,
behavior, accessibility contracts, and selection metadata. Consuming projects
continue to own their content, visual systems, and copied composition code.

## Shipped foundation

- Version 0.1 introduced 19 structural, action, field, choice, feedback,
  loading, and overlay primitives.
- Version 0.2 added 21 navigation, disclosure, form, data, async, command, and
  carousel primitives. See [PHASE-2.md](PHASE-2.md).
- Version 0.3 added 44 application navigation, advanced input, data workflow,
  editor, and media primitives. See [PHASE-3.md](PHASE-3.md).
- Version 0.4 added 36 CMS/media, admin, advanced form, search, and commerce
  workflow components. See [PHASE-4.md](PHASE-4.md).
- Version 0.5 retained 120 contracts while narrowing client boundaries,
  standardizing component anatomy and controlled state, strengthening dense
  responsive workflows, and upgrading project initialization.
- Version 0.6 expands the contract to 128 components and introduces 34 copyable
  project-owned compositions, five specialized packs, three page blueprints,
  natural-language discovery, maturity classification, cross-browser
  conformance, and registry-driven selection.
- Version 0.7 work has begun with decision-grade component guidance, measured
  runtime profiles, trust-boundary metadata, local stability evidence, and
  human-reviewed promotion reporting. The page-plan, lifecycle, wrapper-drift,
  browser-verification, and benchmark stages remain in progress.

## Version 0.7 direction: composition planning

The next product step is an evidence-driven planning layer that can turn a
project brief into an adaptable page baseline. It should not introduce a rigid
runtime page-builder abstraction.

The intended workflow is:

1. Interpret the project description, audience, page goals, content inventory,
   required interactions, and constraints.
2. Rank relevant compositions and blueprints using their selection guidance,
   avoidance conditions, anatomy, compatible neighbors, and project evidence.
3. Produce an inspectable page plan that identifies selected sections, order,
   required Composer primitives, content gaps, and rejected alternatives.
4. Copy the selected wireframes into the consuming project.
5. Adapt structure and content to the actual project, apply the project visual
   system, then run Doctor and browser verification.

The planner should preserve provenance: a project should be able to see why a
composition was selected and which copied files came from the canonical
catalog. Once copied, those files remain project-owned and may be reordered,
replaced, or rewritten.

## Evidence cycle

Use the 0.6 catalog in distinct products while fixing the 0.7 planner contract.
The first recorded production adoption is the mature BGR commerce and CMS site;
the showcase remains fixture evidence rather than a second production claim.
For each page, record:

- the original brief and content constraints;
- ranked candidates and the selected baseline;
- sections added, removed, reordered, or heavily rewritten;
- missing composition patterns and misleading selection queries;
- responsive, accessibility, and implementation failures;
- how much of the blueprint survived final project adaptation.

This evidence determines whether 0.7 needs new compositions, stronger metadata,
neighbor scoring, a page-plan schema, or CLI orchestration. Catalog growth
should follow repeated gaps rather than isolated examples.

## Stabilization track

Alongside composition planning:

- review the eight experimental component APIs after use in at least two
  products;
- review all experimental compositions and blueprints after multiple generated
  sites;
- promote beta or experimental contracts only when production evidence supports
  the change;
- add manual screen-reader, physical touch-device, and Windows High Contrast
  evidence;
- add a production-consumer benchmark for route bundles and interaction
  latency;
- continue monitoring the private showcase's upstream Next.js, PostCSS, and
  Sharp advisories.

## 0.7 entry and exit gates

Work began after the 0.6.0 adoption evidence cycle started. The Stage A
registry-foundation slice is implemented; the following remain release gates.
The 0.7 release should require:

- a registry-defined, versioned page-plan contract;
- deterministic planning fixtures and rejection cases;
- CLI support that never overwrites project adaptations;
- generated-artifact drift checks;
- Doctor coverage for planned and copied files;
- clean fresh-project and upgrade paths;
- responsive, keyboard, accessibility, and cross-browser verification;
- published-package and packed-CLI consumer smokes;
- documented migration and rollback behavior.

`Hero`, generic `Card`, branded headers and footers, typography wrappers,
marketing copy, decorative surfaces, and final page styling remain
project-owned. A composition is a wireframe and selection record, not a
promotion into the runtime component package.
