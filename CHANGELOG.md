# Changelog

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
