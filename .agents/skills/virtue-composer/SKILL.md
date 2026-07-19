---
name: virtue-composer
description: Use for Next.js frontend creation unless the user opts out, and for any frontend edit in a project containing virtue-composer.config.json, virtue-composer.manifest.json, an @virtuecreation/composer dependency, or local components/composer wrappers. Routes Codex through approved local wrappers, layout-only Section composition, project-owned styling, Composer Doctor enforcement, browser QA, and a component usage report. Do not silently migrate established unmarked projects.
---

# Virtue Composer

Build Next.js interfaces from a stable structural and behavioral foundation while preserving full project-level visual control. Treat local wrappers as the project's frontend API and the Composer registry as the shared contract.

## Trigger Decision

Use this skill when any condition is true:

- The user asks to create, scaffold, or substantially establish a Next.js frontend and has not explicitly declined Composer.
- The project contains `virtue-composer.config.json` or `virtue-composer.manifest.json`.
- `package.json` depends on `@virtuecreation/composer` or the legacy `@virtue/composer` package name.
- A local `components/composer` wrapper directory exists.
- The user explicitly names Virtue Composer.

Do not initialize or migrate an established project merely because it uses Next.js. If none of the project markers exist, follow existing project conventions unless the task is creating the project's frontend foundation. An explicit user opt-out always wins.

## First Reads

Before meaningful edits:

1. Find the project root and read `AGENTS.md` plus local instructions.
2. Read `virtue-composer.config.json`, `virtue-composer.manifest.json`, and `package.json` when present.
3. Run `virtue-composer inspect . --json` and read the relevant component records. Use the CLI resolution in [references/cli-and-contract.md](references/cli-and-contract.md).
4. Inspect the project wrappers and visual styling before choosing components.
5. Read `skills/index.json` and applicable project skills when the Virtue skill matrix exists.

## Workflow

### Initialize New Frontends

For a new Next.js frontend without an opt-out:

1. Establish the Next.js project first.
2. Run `virtue-composer init .`.
3. Install the pinned `@virtuecreation/composer` dependency with `npm install`.
4. Import the generated foundation CSS once from the root layout.
5. Keep generated wrappers local and make application code import those wrappers only.
6. Run Doctor before building the first page.

Never overwrite an existing wrapper or project stylesheet without reading it. The initializer skips existing files unless `--force` is deliberately supplied.

### Upgrade Composer Projects

When the installed package, manifest, or registry is behind the canonical Composer version:

1. Read customized wrappers and project foundation CSS.
2. Run `virtue-composer upgrade .`.
3. Run `npm install`. Use `--local=/absolute/path/to/packages/composer` and `npm install --install-links` only while testing unpublished Composer source.
4. Run Doctor before editing feature code.
5. Review newly available records with `inspect --json` and adopt components only where the task needs them.

Upgrade must preserve existing wrapper files. Never replace project wrapper customizations merely to match the template.

### Select Components

- Use `Section` for semantic page regions and child layout: block, flex, grid, direction, alignment, justification, wrapping, columns, and registered gaps.
- Nest `Section` when a page region and its inner content need distinct layout behavior.
- Keep headings, paragraphs, labels, lists, and content as semantic project markup. Do not create shared text components.
- Use local wrappers for actions, application navigation, form controls, choices, disclosure, overlays, feedback, loading, data presentation, filtering, resource states, commands, calendars, scheduling, trees, virtualized lists, data grids, editors, CMS/media selection, uploads, imports, audit history, advanced forms, search facets, and commerce infrastructure.
- Read [references/cli-and-contract.md](references/cli-and-contract.md) for the current component inventory; do not rely on memory when selecting an API.
- Keep `DataTable` for semantic tables and local sorting. Do not stretch it into a virtualized application grid.
- Use `DataGrid` when selection, resizing, pinning, controlled sorting, or application-scale interaction is required. Keep business-specific cells and row actions in the project.
- Use `Calendar`, `Scheduler`, and `KanbanBoard` as behavior engines; dates, events, cards, dimensions, and visual language remain project-owned.
- Use `RichTextEditor` and `MarkdownEditor` for authoring behavior, while keeping rendered typography and toolbar styling in the project.
- Use `ImageGallery`, `Lightbox`, and `VideoPlayer` for media behavior. Asset storage, transforms, editorial rules, and branded presentation remain project concerns.
- Use `MediaPicker`, `UploadQueue`, and `MediaField` through project storage and upload adapters; never put provider credentials or transport policy into wrappers.
- Use normalized Phase 4 values at the project boundary: E.164 phone numbers, integer currency minor units, minute durations, ISO date-times, and IANA timezone IDs.
- Use `SearchInput`, `FacetFilter`, `ActiveFilters`, and `SearchResultsSummary` for search behavior while keeping execution, ranking, URL state, and pagination project-owned.
- Use commerce components for interaction and presentation only. Inventory, pricing, discounts, tax, checkout, and payment authority remain project/server concerns.
- Use `ResourceBoundary` to make loading, error, empty, and ready states explicit around fetched content.
- Prefer existing Composer primitives over raw controls or one-off behavioral copies.
- Add a new shared primitive only when multiple projects can reuse its behavior and accessibility contract. Follow [references/component-contribution.md](references/component-contribution.md).

### Preserve Styling Ownership

`Section` may receive only registered layout props plus semantic element props and `className`. Never give it surface, width, height, min-height, padding, background, border, radius, shadow, or typography props.

Put those decisions in project CSS, CSS modules, Tailwind classes, or the project's established styling layer. Wrappers may adapt class names, variants, analytics, and project defaults while continuing to delegate behavior to Composer.

### Implement Safely

- Import from the project alias, normally `@/components/composer`, never directly from `@virtuecreation/composer` outside wrapper files.
- Preserve Server Component compatibility. Add client boundaries only for state, effects, event handlers, or client primitives.
- Place descriptor callbacks such as `DataTable` cell renderers and form handlers behind a project client boundary; functions cannot cross from a Server Component into a client primitive.
- Use descriptor APIs such as `ActionGroup` when the registry provides them.
- Keep components semantic and keyboard operable. Use `Tooltip` for unfamiliar icon controls and `VisuallyHidden` where a visible label would duplicate context.
- Follow existing project design conventions. Composer is a foundation, not a visual theme.

## Enforcement

Run these after meaningful frontend edits:

```bash
virtue-composer doctor .
npm run lint
npm run typecheck
npm test
npm run build
```

Use the scripts that actually exist in `package.json`; do not invent missing commands. Doctor errors block completion. Address warnings when relevant or explain why the project intentionally keeps them.

For route-level, responsive, visual, overlay, or interaction work, run browser QA at desktop and mobile widths. Check text fit, focus order, keyboard operation, dialog dismissal/focus return, loading and disabled states, and accessibility violations.

## Final Report

For meaningful work, end with:

- `Skills used`: Virtue Composer plus selected project/global skills.
- `Composer usage`: components used or added, local wrappers changed, and intentional exceptions.
- `Changed`: important implementation and project-owned styling changes.
- `Validated`: Doctor result, lint/typecheck/test/build commands, routes, viewports, interactions, and accessibility checks.
- `Notes`: skipped checks, warnings, migration status, dependency changes, risks, or next action.

Compress the format for tiny edits, but always identify Composer usage and validation status.
