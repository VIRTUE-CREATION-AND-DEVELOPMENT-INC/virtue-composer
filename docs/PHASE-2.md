# Phase 2: Application Workflows

Phase 2 ships in Virtue Composer 0.2.0 and expands the library from 19 to 40 components. It preserves the Phase 1 ownership rule: Composer provides semantics, behavior, accessibility, and required geometry; projects provide all visual design.

## Components

- Navigation: `Tabs`, `Breadcrumbs`, `Pagination`, `Menu`.
- Overlays: `Popover`, `Drawer`, `Toast`.
- Disclosure: `Disclosure`, `Accordion`.
- Forms: descriptor-driven `Form`, `SearchSelect`, `FileUpload`.
- Data: `DetailRows`, `ListView`, `DataTable`, `FilterBar`, `MasterDetailLayout`.
- Async feedback: `ResourceBoundary`, `ProgressBar`.
- Advanced interaction: `CommandMenu`, `Carousel`.

## Contract Decisions

- Radix supplies tab, menu, popover, accordion, toast, and drawer behavior.
- `cmdk` supplies command search and searchable selection behavior.
- Embla supplies carousel dragging, snapping, and navigation.
- Native elements remain the default where they already provide the right semantics, including `details`, `progress`, tables, and file inputs.
- `Form`, `FilterBar`, `ActionGroup`, and data components accept descriptors only where descriptors remove repeated wiring without hiding semantic project content.
- `DataTable` supports semantic local or controlled sorting. Large-grid concerns belong to the planned `DataGrid` rather than expanding this component beyond its purpose.

## Generated Artifacts

The registry generates and verifies:

- JSX wrappers for the template and showcase.
- Wrapper index exports.
- Composer manifests.
- The showcase copy of foundation CSS.

Run `npm run registry:sync` after registry or package contract changes. `npm run registry:check` fails when generated artifacts drift.

## Project Upgrade

`virtue-composer upgrade .` adds missing wrappers, index exports, Phase 2 foundation CSS, the current manifest, and package source. Existing wrapper files are preserved so project variants and analytics hooks are not overwritten.

After upgrading, run:

```bash
npm install
virtue-composer doctor .
npm run lint
npm run typecheck
npm test
npm run build
```

Use only scripts that exist in the consuming project.
