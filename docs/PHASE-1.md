# Phase 1 Specification

Phase 1 establishes Virtue Composer as a usable Next.js foundation rather than a collection of examples.

## Deliverables

- Nineteen structural, action, field, choice, feedback, loading, and overlay components.
- TSX source compiled to JavaScript and declarations for JSX consumers.
- Canonical machine-readable registry and schema validation.
- JavaScript project template with local wrappers and foundation CSS.
- `init`, `inspect`, and `doctor` CLI commands with JSON output.
- ESLint boundary rules for project imports, controls, and `Section` ownership.
- Registry-backed Next.js JSX showcase with every component represented.
- Repo-local and globally discoverable Codex skill.

## Completion Gate

Phase 1 is complete when registry validation, package tests, CLI tests, lint, typecheck, production build, Doctor, desktop/mobile browser checks, interaction checks, and automated accessibility checks pass.

## Dependency Note

The pinned stable Next.js line currently brings PostCSS 8.4.31 and its moderate CSS-stringification advisory. npm reports no non-breaking stable Next.js fix and recommends an invalid framework downgrade. Track the advisory and remove this note when the stable Next.js dependency updates its PostCSS pin. There are no high or critical audit findings in Phase 1.
