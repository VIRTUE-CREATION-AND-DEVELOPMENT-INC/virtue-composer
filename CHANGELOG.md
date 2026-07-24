# Changelog

## 0.7.0 — 2026-07-24

The first implementation slice establishes the registry foundations for
evidence-driven planning without changing stable 0.6 component APIs.

### Registry and agent decisions

- Added decision-grade guidance for an initial set of high-risk overlay, form,
  upload, data, editor, media, import, abuse-prevention, and commerce
  components.
- Added measured own-module runtime cost, client-boundary, engine, effect,
  listener, portal, scale, native-alternative, and lazy-load metadata with
  regression checks.
- Added practical trust-boundary metadata covering HTML, data sensitivity,
  validation authority, secrets, network and persistence authority, redirects,
  and commerce ownership.
- Added a metadata-driven `FileUpload` Doctor warning that explicitly treats
  `accept` as a chooser hint and requires server-side validation.

### Evidence and reporting

- Added a versioned stability-evidence schema and local evidence registry,
  separating one production brownfield adoption from the maintained showcase
  fixture.
- Added `virtue-composer stability` with per-component project diversity,
  browser, automated accessibility, manual accessibility, defect, revision,
  risk, threshold, recommendation, and human-review reporting.
- Promotion remains a human decision even when numeric evidence thresholds are
  met.

## 0.6.0 — 2026-07-23

Virtue Composer 0.6.0 expands the registry to 128 components, classifies component maturity, normalizes complex interaction contracts, and adds candidate-selection enforcement for agents and CI. All published 0.4.0 and 0.5.0 component export paths remain available.

### Components

- Added experimental `SelectableCardGroup`, `ResizablePanels`, `Wizard`, `TransferList`, `ColorPicker`, `RatingInput`, `MentionInput`, and `EditableList` contracts with wrappers, fixtures, tests, accessibility coverage, and project-owned styling hooks.
- Normalized controlled and uncontrolled behavior across overlays, dropdowns, forms, editors, media workflows, and shared state helpers.
- Expanded DataGrid filtering and column visibility, Scheduler day/week movement and resizing, MediaPicker paging and selection persistence, and InlineEdit asynchronous save recovery.
- Hardened DatePicker and DateRangePicker locale, bounds, deterministic `today`, RTL, modal focus, and two-step range selection.
- Fixed narrow-layout, zoom, RTL, forced-color, and cross-browser overflow issues found during the stabilization matrix.

### Registry, CLI, and agent enforcement

- Classified the registry as 40 stable, 80 beta, and 8 experimental components, with required introduction versions and structured selection guidance.
- Added contract-convention validation for lifecycle metadata, public exports, controlled-state triplets, and deprecation relationships.
- Added registry-owned `selectionHints`, `report --candidates`, per-file usage reporting, configurable `componentSelection` findings, and `doctor --strict`.
- Added ESLint rules for specialized inputs, minor-unit Money values, explicit Section semantics, and form misuse of SegmentedControl.
- Generated projects now receive a strict `composer:check` script, and the Composer skill requires candidate auditing before completion.
- Added a canonical registry for 34 project-owned composition wireframes and three page blueprints, including contact-form and general-purpose text/media patterns plus commerce, guided-workflow, search, application, and immersive packs, with portfolio evidence, anatomy, responsive behavior, accessibility checks, compatible neighbors, and natural-language selection metadata.
- Added `compositions` discovery and `compose` copying commands with pack filtering and complete-pack installation. Copied JSX and CSS use local Composer wrappers, install missing wrapper dependencies, update manifests, and preserve project adaptations.
- Added a searchable `/sandbox` that renders the same generated templates shipped through the CLI, including pack and family filters plus complete service-business, community/nonprofit, and editorial/portfolio blueprint previews.

### Release protection

- Expanded unit, high-risk interaction, responsive, Axe, RTL, reduced-motion, forced-color, 200% reflow, and Chromium/Firefox/WebKit coverage.
- Added component, root-export, client-boundary, dependency, and compiled-size budgets.
- Added stability policy and stabilization evidence for the complete 128-component release.
- Added composition-template drift checks, CLI copy/adaptation tests, packed-CLI production copying, and responsive/Axe/browser interaction coverage for the sandbox.

## 0.5.0 — 2026-07-22

Virtue Composer 0.5.0 is a backward-compatible optimization and infrastructure release. It retains all 120 registered component contracts and every public 0.4.0 export path.

### Components

- Reduced client component boundaries from 80 to 73 while preserving interactive behavior.
- Added consistent root slots, internal styling hooks, and exposed state across the component catalog.
- Standardized controlled and uncontrolled behavior for shared selector and media workflows.
- Refined Calendar, DatePicker, DateRangePicker, Scheduler, DataGrid, KanbanBoard, and media components for responsive and keyboard use.
- Added explicit minor-unit Money props while preserving legacy major-unit props.
- Added Section semantic and forbidden-style diagnostics without changing its compatible runtime contract.

### CLI and project workflow

- Added root versus `src` layout detection, alias generation, explicit structure options, and a pinned local CLI dependency.
- Added selective wrapper initialization, the `add` command, compact component inspection, used-component filtering, and usage reports.
- Replaced JSX regular-expression checks with AST analysis, advisory CSS Module layout detection, configurable severities, path exceptions, and scan coverage reporting.
- Added a lightweight skill workflow for copy-only and project-CSS-only edits.

### Release protection

- Added published-export compatibility checks, component budgets, root-layout and selected-wrapper smokes, browser accessibility and interaction coverage, and packed Composer/CLI production consumers.

## 0.4.0 — 2026-07-18

Added Phase 4 workflow infrastructure and brought Virtue Composer to 120 registered components.
