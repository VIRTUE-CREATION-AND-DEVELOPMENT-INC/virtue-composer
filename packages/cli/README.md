# @virtuecreation/composer-cli

Initialize, upgrade, inspect, validate, and review evidence for Virtue Composer
projects.

```bash
npx @virtuecreation/composer-cli@0.6.0 init .
npx @virtuecreation/composer-cli@0.6.0 doctor .
npx @virtuecreation/composer-cli@0.6.0 report . --candidates
npx @virtuecreation/composer-cli@0.6.0 compositions . --query="service business"
npx @virtuecreation/composer-cli@0.6.0 compositions . --pack=guided-workflows
npx @virtuecreation/composer-cli@0.6.0 compose . --pack=commerce
npx @virtuecreation/composer-cli@0.6.0 compose . --blueprint=service-business
```

The repository workspace is developing 0.7 while 0.6.0 remains the documented
public adoption baseline. In the 0.7 workspace, use:

```bash
virtue-composer inspect . --component=DataGrid --json
virtue-composer stability . --component=FileUpload --json
```

The default installation mode uses the public `@virtuecreation/composer` package and installs a pinned `@virtuecreation/composer-cli` dev dependency for future local commands. Contributors working on Composer itself can opt into a local package source explicitly.

`init` detects root and `src` application layouts, installs a strict `composer:check` script, and supports explicit structure overrides. Pass `--components=Section,Button` for an on-demand wrapper set and add later components with `add --components=Money`. Use `inspect --used --compact`, `inspect --component=button`, `inspect --category=field`, or `report --candidates` for focused usage and replacement guidance. Candidate records include file, line, confidence, component stability, wrapper status, and an add command when needed. Use `doctor --strict` to make warnings fail CI.

`compositions` searches the 34-entry composition catalog and three page
blueprints using IDs, packs, families, keywords, and natural-language example
queries. The core catalog is joined by commerce, guided-workflow, search,
application, and immersive packs. `compose --compositions=id,id`,
`compose --pack=id`, or `compose --blueprint=id` copies project-owned JSX and
CSS to `compositionRoot`, installs any missing local Composer wrappers, updates
the manifest, and preserves existing adaptations unless `--force` is explicitly
supplied.

Full component inspection exposes decision-grade guidance, measured own-module
runtime profiles, and trust-boundary metadata where available. Compact
inspection includes client requirements, relative cost, complexity, lazy-load
suitability, HTML acceptance, data sensitivity, and security warnings.
Measurements exclude transitive dependencies and consumer bundling, so they
support relative decisions rather than exact bundle predictions.

`stability` aggregates the local versioned evidence registry per component:
production-project and use-case diversity, browser and accessibility evidence,
manual screen-reader/touch/high-contrast status, defects, breaking revisions,
unresolved risks, thresholds, recommendation, and reviewer decision. Evidence
counts never promote a component automatically.

New 0.7 configurations enable trust-boundary findings as warnings. Existing
0.6 configurations that do not declare `trustBoundaries` retain an implicit
`off` default until an upgrade or deliberate config edit opts in, avoiding a
surprise strict-Doctor failure.
