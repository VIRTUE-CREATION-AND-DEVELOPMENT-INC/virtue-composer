# Virtue Composer stabilization report

Date: July 23, 2026  
Scope: recommended stabilization order 1–7, backlog components, composition model, library navigation, and UI/UX validation  
Status: complete; all required automated gates pass
Release target: 0.6.0

## Executive summary

Composer now has a clearer contract for both humans and Codex, stronger controlled and uncontrolled component behavior, explicit maturity levels, a project-owned composition model, broader high-risk workflow coverage, and a production browser matrix across Chromium, Firefox, and WebKit.

The canonical library contains 128 components:

| Stability | Count | Meaning |
| --- | ---: | --- |
| Stable | 40 | Core contracts suitable for normal production use |
| Beta | 80 | Supported contracts that still need wider project evidence |
| Experimental | 8 | New backlog components whose APIs may still change |
| Deprecated | 0 | No current removals or replacement deadlines |

The implementation remains within its existing client and dependency budgets. Compiled JavaScript is 256,183 bytes, an increase of 2,293 bytes (0.9%) from the 253,890-byte baseline. The largest component is Scheduler at 9,693 bytes against a 12,000-byte component budget.

## Recommended order 1–6

### 1. Freeze and classify the component contract

Finding: the registry described names, states, accessibility checks, and fixtures, but did not express lifecycle maturity or practical selection guidance. That made it too easy for an agent or consumer to treat every component as equally proven.

Changes:

- Added required `stability`, `since`, and `guidance` metadata to every registry record.
- Guidance now records when to use a component, when to avoid it, alternatives, companions, and responsive expectations.
- Strengthened the registry schema and validator to reject missing fields, unknown properties, invalid layers or prop kinds, duplicate relationships, and invalid component references.
- Added `contracts:check` to verify lifecycle metadata, source files, package subpaths, controlled-state triplets, deprecation alternatives, and export counts.
- Added a published stability policy covering maturity, compatibility, state naming, deprecation, and release evidence.
- Exposed stability and version information through CLI inspection.

Outcome: Composer can distinguish a dependable core from APIs that still need project evidence without hiding either group from the library.

### 2. Normalize state and lifecycle behavior

Finding: several interactive components had only part of the expected controlled/uncontrolled contract, and some async transitions did not fully guard duplicate or stale state.

Changes:

- Normalized `value/defaultValue/onValueChange` and `open/defaultOpen/onOpenChange` behavior where applicable.
- Added uncontrolled support to CommandMenu, FacetFilter, and MediaField.
- Stabilized the shared controllable-state setter.
- Prevented duplicate asynchronous Form submissions.
- Cleared server feedback and recomputed dependent field visibility after native Form resets.
- Synchronized externally controlled RichTextEditor content without emitting a false user update.
- Added async validation, recoverable save errors, cancellation callbacks, and optional rollback to InlineEdit.
- Added configurable modality and close labels to Dialog and Drawer while retaining modal defaults.

Components exercised by the state-conformance work include CommandMenu, FacetFilter, MediaField, Form, RichTextEditor, InlineEdit, DataGrid, MediaPicker, RadioGroup, RelationSelect, SearchSelect, TreeSelect, ComboboxMultiSelect, Menu, Popover, Drawer, and KanbanBoard.

Outcome: consumers can choose controlled or local state without silent divergence, and pending/error/reset transitions are more predictable.

### 3. Harden high-risk workflows and complete the backlog

Finding: the largest remaining risk was not basic rendering; it was multi-step interaction under selection, filtering, paging, resizing, scheduling, and modal focus.

New experimental backlog components:

- SelectableCardGroup
- ResizablePanels
- Wizard
- TransferList
- ColorPicker
- RatingInput
- MentionInput
- EditableList

High-value refinements:

- DataGrid gained controlled filtering and column visibility, server/manual modes, row counts, and optional row virtualization.
- Scheduler gained day/week views, cross-day rendering, move and resize callbacks, drag/drop behavior, and keyboard move/resize commands.
- MediaPicker gained controlled search, paging, load-more behavior, and selection persistence as item pages change.
- MentionInput now respects IME composition and safely resets its active suggestion when result sets shrink.
- EmptyState now fails early when action descriptors are passed as if they were rendered React content.
- Dialog and Drawer anatomy now expose consistent slots for project styling.

The high-risk matrix covers controlled DataGrid selection/sorting/filtering/visibility/pinning, cross-day Scheduler events, filtered TransferList selections, and MediaPicker selection across page replacement.

Outcome: the workflows most likely to fail under real application state now have explicit behavior and regression tests.

### 4. Complete responsive, accessibility, localization, and browser coverage

Finding: Chromium-only testing concealed small but real engine differences. At 320px, ColorPicker overflowed by 29px in Firefox and 8px in WebKit. Additional audits found physical-position and minimum-width assumptions that could break RTL or compact layouts.

Changes:

- Added browser projects for Chromium, Firefox, and WebKit.
- Added automated layout and Axe checks at 320, 390, 768, 1024, and 1440 pixels.
- Added RTL, reduced-motion, forced-colors, and 200% reflow coverage.
- Made ColorPicker controls wrap and shrink across engines.
- Removed the HoneypotField's physical off-screen positioning, eliminating a 10,000px RTL overflow.
- Made SearchInput and ResourceToolbar shrink correctly on narrow screens.
- Adjusted the showcase's compact-desktop composition to avoid two-column overflow.
- Made browser assertions tolerant of equivalent computed-CSS serialization across engines.
- Added locale, week-start, direction, and bounds support to DatePicker and DateRangePicker.
- Preserved focus containment, Escape dismissal, and focus return for dialogs, drawers, date pickers, and MediaPicker.

Outcome: all tested widths have no document-level horizontal overflow, and the tested WCAG A/AA rules report no Axe violations.

### 5. Establish client and bundle budgets

Finding: the library needed objective limits so future component growth would not quietly increase hydration, dependencies, or root-import cost.

Measured result:

| Metric | Result | Gate |
| --- | ---: | ---: |
| Components | 128 | At least 128 |
| Client boundaries | 81 | No more than 81 |
| Effect-bearing files | 11 | Reported for review |
| Runtime dependencies | 36 | No more than 36 |
| Export subpaths | 129 | One per component plus root |
| Compiled JavaScript | 256,183 bytes | No more than 10% over baseline |
| Largest component | 9,693 bytes | No more than 12,000 bytes |
| Root index | 10,916 bytes | No more than 12,000 bytes |

The analyzer now reports the five largest modules and fails when client boundaries, dependencies, subpaths, aggregate size, component size, or root-index limits regress.

Outcome: the backlog and refinements did not increase the client-boundary or runtime-dependency counts and remained inside every published size gate.

### 6. Improve agent guidance, library discovery, and release evidence

Finding: a 128-component library needs capability-oriented discovery; a title-only list makes both users and agents over-select familiar primitives.

Changes:

- Library search now indexes title, ID, layer, stability, states, accessibility checks, replacements, guidance, alternatives, and companions.
- Added layer and stability filters, live result counts, active-location state, collapsible groups, `/` keyboard focus, and a mobile library drawer.
- Added maturity labels to navigation results.
- Updated the Composer skill to require registry-guided selection, controlled-state conventions, and stability-aware decisions.
- Added registry-driven `selectionHints`, per-file CLI usage reporting, missed-component candidate reporting, strict Doctor enforcement, and Composer-specific ESLint rules.
- Added a generated `composer:check` CI command to initialized and upgraded projects.
- Updated README, CLI documentation, roadmap, generated manifests, templates, and package exports for the 128-component contract.
- Added canonical Chromium visual references for Calendar and the mobile DateRangePicker dialog.
- Extended the required verification chain with contract checks.

Outcome: navigation is faster for people, and the project guidance gives Codex better evidence for choosing the smallest correct component.

### 7. Add the project-owned composition model

Finding: individual components were a sound foundation, but Codex still had to invent page-level arrangements before it could adapt and style a project. Repeated arrangements across the web-app portfolio provided enough evidence for an initial wireframe catalog.

Changes:

- Added canonical schemas and registries for 34 experimental compositions and three experimental page blueprints, including contact-form and general-purpose text/media categories plus commerce, guided-workflow, search, application, and immersive packs.
- Recorded natural-language selection descriptions, queries, keywords, avoidance guidance, anatomy, component dependencies, responsive behavior, accessibility requirements, compatible neighbors, and source-project evidence.
- Added canonical project-owned JSX and CSS templates. Registry sync copies those templates into the packaged CLI and generates the showcase examples from the same source.
- Added `virtue-composer compositions` for filtering by query, pack, family, composition, or blueprint.
- Added `virtue-composer compose` for copying individual compositions, complete specialized packs, or complete blueprints, installing required wrappers, updating the manifest, and preserving local adaptations unless `--force` is explicit.
- Extended Doctor to validate installed composition files, shared composition CSS, blueprint membership, and manifest completeness.
- Added the `/sandbox` workbench with all 34 examples, natural-language search, pack and family filtering, copy commands, anatomy metadata, and complete service-business, community/nonprofit, and editorial/portfolio blueprint previews.
- Added CLI, packed-consumer, responsive, Axe, cross-browser, and interaction tests for the composition workflow.

Outcome: Codex can select a proven page-level baseline, compose a wireframe, and then adapt structure, content, and project-owned styling without introducing a rigid runtime layout system.

## UI/UX backlog findings and fixes

### Calendar and date selection

- Calendar uses a fluid seven-column grid instead of collapsing dates into a vertical list.
- DatePicker and DateRangePicker use focus-managed modal dialogs.
- DateRangePicker remains open after the first date and closes only after the second date completes the range.
- Two-month range layouts stack at mobile widths and preserve selection, focus, bounds, RTL, and locale behavior.

### Structural consistency

- Stepper now demonstrates and validates both horizontal and vertical structures with stable markers and connectors.
- InlineEdit has clear spacing between value/action and field/action regions, plus stronger async feedback.
- Native selects and Composer dropdowns share the same control height and arrow treatment in the showcase.
- RichTextEditor controls align to the start with a default 7px gap and retain a scrollable overflow mode.
- MediaPicker's overlay/content stacking and dialog focus make its options interactive again.

### Responsive defects found during testing

- Fixed SearchInput/ResourceToolbar overflow at 320px.
- Fixed the two-column showcase/FilterBar overflow near 1024px.
- Fixed HoneypotField overflow in RTL.
- Fixed ColorPicker overflow unique to Firefox and WebKit.

## Validation evidence

### Required workspace verification

`npm run verify` passed, including:

- registry validation and generated-artifact drift checks;
- contract convention checks;
- TypeScript checks for Composer and the Next.js showcase;
- 114 Composer tests across 10 files;
- 16 CLI tests;
- 2 Composer ESLint rule suites;
- ESLint;
- Composer and production Next.js builds;
- component/client/bundle budget checks;
- Doctor: 173 files, 0 errors, 0 warnings;
- fresh-project, root-project, and upgrade smoke builds.

### Browser and UI/UX verification

`npm run test:browser` passed across Chromium, Firefox, and WebKit:

- 72 browser tests total;
- 70 passed;
- 2 intentionally skipped because pixel baselines are canonical Chromium-only references;
- functional behavior still passed in Firefox and WebKit;
- responsive/Axe coverage at five widths;
- modal focus, Escape, focus return, two-date range completion, Stepper geometry, RichTextEditor spacing, dropdown consistency, MediaPicker interaction, Calendar grid, Scheduler collisions, DataGrid keyboard resizing, Kanban empty targets, and ImageGallery selection.

### Release and compatibility verification

- Published compatibility passed for all 121 v0.4.0 export subpaths and peer dependencies.
- Package dry runs passed for Composer, registry, CLI, and ESLint config.
- Published-package smoke passed with a 139,806-byte tarball, clean install, clean Doctor run, and production build.
- Packed-CLI smoke passed with registry resolution, natural-language composition discovery, composition copying, clean Doctor run, and production build.
- The aggregate `npm run release:check` command passed end to end for 0.6.0.
- `git diff --check` passed.

## Changed-file inventory

Shared component implementation:

- Added `packages/composer/src/{SelectableCardGroup,ResizablePanels,Wizard,TransferList,ColorPicker,RatingInput,MentionInput,EditableList}.tsx`.
- Refined `packages/composer/src/{ComboboxMultiSelect,CommandMenu,DataGrid,DatePicker,DateRangePicker,Dialog,Drawer,EmptyState,FacetFilter,Form,InlineEdit,KanbanBoard,MediaField,MediaPicker,Menu,PhoneInput,Popover,RadioGroup,RelationSelect,RichTextEditor,Scheduler,SearchSelect,TreeSelect,useControllableState}.tsx`.
- Updated `packages/composer/src/index.ts` and `packages/composer/package.json` exports.

Contract, CLI, and generated consumer artifacts:

- Updated `packages/registry/components.json`, `components.phase-3.json`, and `components.phase-4.json`; added `components.phase-5.json`.
- Added `packages/registry/{composition.schema.json,compositions.json,blueprint.schema.json,blueprints.json}` and 34 canonical templates under `packages/registry/templates/compositions`.
- Updated registry schema, validator, sync script, package exports, and registry entry point.
- Added `scripts/check-contract-conventions.mjs`; enhanced `scripts/analyze-components.mjs`.
- Added CLI composition discovery/copying, blueprint installation, manifest enforcement, tests, and documentation.
- Updated wrapper indexes, manifests, and Composer CSS in `templates/next-jsx`, `packages/cli/template/next-jsx`, and `apps/showcase-jsx`.

Showcase, tests, and documentation:

- Added `apps/showcase-jsx/src/app/phase-five-showcase.jsx` and eight generated showcase wrappers.
- Added the generated `apps/showcase-jsx/src/app/sandbox` catalog, 34 examples, three blueprint previews, and placeholder media.
- Updated showcase navigation, fixtures, responsive CSS, and phase-four usage.
- Added `packages/composer/test/{backlog-refinements,contract-conformance,high-risk-matrix,phase-five}.test.tsx` and extended phase-two/four tests.
- Expanded `tests/browser/showcase.spec.mjs`, `playwright.config.mjs`, and the Chromium visual snapshots.
- Added `docs/COMPONENT-STABILITY.md`; updated `README.md`, `docs/ROADMAP.md`, the Composer skill, and its contract reference.

## Remaining risks and recommended next evidence

- The 80 beta components are supported but intentionally not labeled stable until they have broader production-project evidence.
- The eight new backlog components are experimental. Their registry guidance and tests are complete, but their APIs should be reviewed after use in at least two distinct products before promotion.
- All 34 compositions and three blueprints are experimental. Their structure should be reviewed after use in multiple generated sites before stabilization, and copied project adaptations must not be mistaken for changes to the canonical templates.
- Visual snapshots are intentionally Chromium/macOS canonical. Firefox and WebKit are covered functionally and for accessibility, but not with independent pixel baselines.
- `npm audit --omit=dev` reports three high findings through the private showcase's Next.js 16.2.11 dependency graph: PostCSS and Sharp/libvips advisories. npm's suggested Next.js 9.3.3 downgrade is not a valid remediation. The published Composer artifacts do not bundle those showcase dependencies; see `docs/0.6.0-LAUNCH-READINESS.md` for the scoped vendor exception and publication policy.
- Axe and headless browser checks do not replace a manual screen-reader session, physical touch-device testing, or Windows high-contrast testing before a major stable release.
- Bundle gates measure compiled module output and boundaries, not runtime interaction latency or application-level route bundles. A future production consumer benchmark should add those measurements.
- The changes are left uncommitted so they can be reviewed as one stabilization batch.

No required automated check was skipped. The only automated skips were the two deliberate non-Chromium pixel comparisons described above.

## Skill used

The `virtue-composer` project skill governed component selection, registry-first changes, generated-artifact synchronization, project-owned styling boundaries, and the required validation and reporting workflow.
