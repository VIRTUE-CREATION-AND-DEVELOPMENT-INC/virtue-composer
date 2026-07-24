# Virtue Composer

Virtue Composer is a Next.js frontend contract system coupled to a Codex skill and machine-readable registry. Shared components own structure, behavior, accessibility, and decision contracts; consuming projects own visual design.

The 0.7 workspace is under active development on top of the compatible 0.6
foundation. Version 0.6 includes 128 component contracts, 34 copyable composition
wireframes across a core catalog and five specialized packs, and three
adaptable page blueprints. Components own reusable
behavior and accessibility. Compositions give Codex and project teams a
registry-described starting arrangement while remaining fully project-owned
JSX and CSS.

The first 0.7 implementation slice adds validated decision guidance, measured
own-module runtime profiles, practical trust-boundary metadata, metadata-driven
Doctor warnings, and a human-reviewed component stability evidence report.
These contracts are additive; they do not change stable 0.6 component APIs or
install a visual theme.

```bash
npm install
npm run verify
npm run dev
```

The showcase runs at `http://localhost:3000` by default.
The composition sandbox runs at `http://localhost:3000/sandbox`.

## Adopt In A Project

Install the current public release:

```bash
npx @virtuecreation/composer-cli@0.6.0 init /path/to/next-project
cd /path/to/next-project
npm install
```

Import `src/styles/composer.css` once from the consuming app's root layout. Application code imports from `@/components/composer`; only generated local wrappers import `@virtuecreation/composer` directly.

The initializer pins the current public `@virtuecreation/composer` version. Composer contributors can explicitly use `--local=/absolute/path/to/packages/composer` and `npm install --install-links` while testing unpublished source changes.

Upgrade an initialized Phase 1 project without overwriting customized wrappers:

```bash
npx @virtuecreation/composer-cli upgrade /path/to/next-project
cd /path/to/next-project
npm install
virtue-composer doctor .
```

Run `npm run release:check` before every package publication. It verifies the workspace, inspects the tarball, installs that tarball in an isolated Next.js consumer, runs Doctor, and completes a production build without publishing.

Generated projects include `npm run composer:check`, which runs Doctor in strict mode. Use `virtue-composer report . --candidates` to see per-file Composer usage and high-confidence alternatives the implementation may have overlooked.

Use focused inspection and stability evidence when component choice is costly:

```bash
virtue-composer inspect . --component=DataGrid --json
virtue-composer stability . --component=FileUpload --json
```

Full inspection records expose state ownership, server/client boundaries,
serialization, focus responsibilities, failure modes, measured own-module
cost, and trust-boundary expectations where decision-grade coverage exists.
The byte measurement excludes dependencies and consumer bundler behavior and is
for relative planning, not an exact route-bundle prediction. Stability evidence
never promotes a component automatically.

Search the composition catalog using intent and copy a composition or complete
page blueprint into the project:

```bash
virtue-composer compositions . --query="impact statistics"
virtue-composer compositions . --pack=guided-workflows
virtue-composer compose . --compositions=proof-metric-strip
virtue-composer compose . --pack=commerce
virtue-composer compose . --blueprint=service-business
```

Copied files are written to the configured `compositionRoot`, use local Composer
wrappers, and are intentionally safe to adapt. Existing composition files and
project CSS are preserved unless `--force` is explicitly supplied.

Component maturity, state naming, compatibility, and release evidence are defined in [docs/COMPONENT-STABILITY.md](docs/COMPONENT-STABILITY.md). Run `npm run contracts:check` to validate lifecycle metadata, controlled-state conventions, source files, and package exports.

## Contract

`Section` owns semantic element choice and child layout only. The consuming
project owns surfaces, width, height, min-height, padding, backgrounds, borders,
radius, shadows, typography, and all branded composition. Registry compositions
are copied into the consuming project; they never become a visual runtime
dependency.

See [Phase 1](docs/PHASE-1.md), [Phase 2](docs/PHASE-2.md), [Phase 3](docs/PHASE-3.md), [Phase 4](docs/PHASE-4.md), the [0.7 implementation record](docs/0.7.0-IMPLEMENTATION.md), the [component roadmap](docs/ROADMAP.md), and the [portfolio component backlog](docs/PORTFOLIO-COMPONENT-BACKLOG.md).

## License

Virtue Composer is available under the [MIT License](LICENSE).
