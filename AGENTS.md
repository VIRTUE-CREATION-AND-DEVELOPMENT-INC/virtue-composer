# Virtue Composer

Virtue Composer is a Next.js-first frontend foundation. It provides structural and behavioral components while every consuming project owns its visual design.

## Required Reads

- Read `packages/registry/components.json` before adding or changing a shared component.
- Read `.agents/skills/virtue-composer/SKILL.md` for Composer project work.
- Treat the registry as the canonical component contract. Do not duplicate its component list elsewhere.

## Architecture

- `packages/composer`: TSX source compiled to JavaScript and declarations.
- `packages/registry`: canonical component metadata and validation.
- `packages/cli`: initialization, inspection, and Doctor enforcement.
- `packages/eslint-config`: project import and raw-control restrictions.
- `apps/showcase-jsx`: JavaScript-only Next.js consumer and browser QA surface.
- `templates/next-jsx`: files installed into consuming projects.
- `.agents/skills/virtue-composer`: reusable Codex workflow.

## Component Contract

- Keep `Section` structural. It may own semantic element choice and child layout only.
- Keep surface, width, height, padding, background, border, radius, shadow, and typography in project styles.
- Keep text semantic and project-owned; do not add heading or paragraph components.
- Prefer existing Composer components before adding raw controls or new shared abstractions.
- Add a shared component only when it is reusable across projects and has registry metadata, tests, fixtures, and accessibility coverage.
- Preserve Server Component compatibility unless browser state, effects, or interactive primitives require a client boundary.

## Validation

Run `npm run verify` after meaningful shared changes. For visual changes, also run browser checks against the showcase at desktop and mobile widths.

Final reports must name skills and components used, changed files, validation performed, skipped checks, and known risks.
