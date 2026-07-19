# Virtue Composer

Virtue Composer is a Next.js component foundation coupled to a Codex skill and machine-readable registry. Shared components own structure, behavior, and accessibility; consuming projects own visual design.

Version 0.4 includes 120 components, a JavaScript/JSX showcase, a local-wrapper project template, `init`/`upgrade`/`inspect`/`doctor` CLI commands, generated registry artifacts, ESLint boundaries, and a globally discoverable Codex skill linked to this repository. Phase 4 adds reusable CMS/media, admin, advanced form, search, and commerce infrastructure while keeping persistence and visual design project-owned.

```bash
npm install
npm run verify
npm run dev
```

The showcase runs at `http://localhost:3000` by default.

## Adopt In A Project

After the public packages are released:

```bash
npx @virtuecreation/composer-cli init /path/to/next-project
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

## Contract

`Section` owns semantic element choice and child layout only. The consuming project owns surfaces, width, height, min-height, padding, backgrounds, borders, radius, shadows, typography, and all branded composition.

See [Phase 1](docs/PHASE-1.md), [Phase 2](docs/PHASE-2.md), [Phase 3](docs/PHASE-3.md), [Phase 4](docs/PHASE-4.md), the [component roadmap](docs/ROADMAP.md), and the [portfolio component backlog](docs/PORTFOLIO-COMPONENT-BACKLOG.md).

## License

Virtue Composer is available under the [MIT License](LICENSE).
