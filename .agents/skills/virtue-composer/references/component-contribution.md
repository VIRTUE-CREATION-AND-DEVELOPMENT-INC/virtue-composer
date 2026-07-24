# Component Contribution

Promote behavior into Composer only when it is reusable across projects, has a stable semantic purpose, and removes repeated accessibility or interaction work. Project-specific headers, heroes, cards, footers, typography, surfaces, and page compositions stay in the consuming project.

Every shared component change requires:

1. TSX implementation in `packages/composer/src` with the narrowest client boundary possible.
2. Root and subpath package exports with generated JavaScript and declarations.
3. A canonical record in the current `packages/registry/components*.json` phase file including props, meaningful `propContracts`, states, accessibility checks, replacement targets, showcase fixtures, Doctor rules, and decision-grade guidance when selection is ambiguous.
4. Focused unit tests for behavior and semantics.
5. Registry artifact generation for JavaScript/JSX wrappers, wrapper indexes, manifests, and foundation CSS synchronization.
6. All meaningful states in the JSX showcase, including controlled states when the API supports them.
7. Doctor and ESLint updates when the component creates a new project boundary.
8. Keyboard, responsive, and accessibility verification.

Interactive, high-cost, form, upload, media, advanced-content, admin, or
commerce components must also declare measured runtime and practical
trust-boundary metadata. Run `npm run analyze:components:check` after the build
to review own-module byte and effect-count drift. Never describe frontend
validation as the server security boundary.

Keep package components visually neutral. Stable geometry required for behavior is acceptable; aesthetic surfaces belong to projects.

Run `npm run registry:sync` after changing the registry or package exports, then keep `npm run registry:check` in verification. Add a marked foundation CSS phase block when an upgrade must merge new geometry into existing projects.
