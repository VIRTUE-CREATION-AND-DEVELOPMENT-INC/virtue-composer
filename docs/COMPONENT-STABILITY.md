# Component Stability Contract

Virtue Composer treats the registry as the public API. A component is not ready to move between stability levels until its source, registry record, wrapper, fixtures, tests, accessibility checks, package export, and migration guidance agree.

## Stability levels

- `stable`: the API is expected to remain compatible. Breaking changes require a documented deprecation and migration path.
- `beta`: the behavior is shipped and supported, but complex combinations and integration feedback may still refine the API.
- `experimental`: the contract is available for evaluation and can change in a minor release with explicit release notes.
- `deprecated`: the component remains compatible temporarily while its registry guidance names at least one replacement.

Every registry record declares `stability`, `since`, and decision guidance. `npm run contracts:check` prevents unclassified records, invalid relationships, missing exports, and incomplete controlled-state triplets.

## State naming

Composer uses the following public conventions:

- Value state: `value`, `defaultValue`, and `onValueChange`.
- Boolean choice state: `checked`, `defaultChecked`, and `onCheckedChange`.
- Overlay or disclosure state: `open`, `defaultOpen`, and `onOpenChange`.
- `loading`: external data or content is being retrieved.
- `pending`: a mutation or component action is in flight.
- `submitting`: a form submission is in flight.
- `disabled`: the control cannot be operated.
- `readOnly`: the value remains perceivable but cannot be changed.
- `error`: field- or component-level actionable feedback.

Native controls may continue to expose their native `onChange` contract. Descriptor and behavior components use the Composer triplets above. Controlled values always remain authoritative; default values initialize internal state only.

## Interaction guarantees

Interactive components must document and test the applicable guarantees:

- keyboard operation and visible focus;
- focus entry, containment, dismissal, and return for overlays;
- form serialization, pending protection, validation association, and native reset behavior;
- non-color state communication and live announcements;
- controlled state updates during open, editing, or pending transitions;
- touch-accessible controls and contained responsive overflow;
- reduced-motion, RTL, translated-content, and 200 percent reflow behavior where applicable.

## Compatibility changes

Additive props can ship without deprecation when existing behavior remains unchanged. Renames or semantic changes must first preserve the previous prop, mark the component or prop as deprecated in documentation, name the replacement, and add a migration note. Silent semantic changes are not allowed.

## Release evidence

A stability promotion requires:

1. registry and contract convention checks;
2. TypeScript, unit, lint, build, Doctor, initialization, and upgrade checks;
3. Chromium, Firefox, and WebKit browser coverage for relevant interactions;
4. desktop, tablet, mobile, 200 percent reflow, RTL, reduced-motion, and forced-color checks where applicable;
5. package and per-component size budgets;
6. a readable findings and migration report.
