# @virtuecreation/composer-cli

Initialize, upgrade, inspect, and validate Virtue Composer projects.

```bash
npx @virtuecreation/composer-cli@0.6.0 init .
npx @virtuecreation/composer-cli@0.6.0 doctor .
npx @virtuecreation/composer-cli@0.6.0 report . --candidates
npx @virtuecreation/composer-cli@0.6.0 compositions . --query="service business"
npx @virtuecreation/composer-cli@0.6.0 compositions . --pack=guided-workflows
npx @virtuecreation/composer-cli@0.6.0 compose . --pack=commerce
npx @virtuecreation/composer-cli@0.6.0 compose . --blueprint=service-business
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
