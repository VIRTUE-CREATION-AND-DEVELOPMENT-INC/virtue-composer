# @virtuecreation/composer-cli

Initialize, upgrade, inspect, and validate Virtue Composer projects.

```bash
npx @virtuecreation/composer-cli@0.4.1 init .
npx @virtuecreation/composer-cli@0.4.1 doctor .
```

The default installation mode uses the public `@virtuecreation/composer` package and installs a pinned `@virtuecreation/composer-cli` dev dependency for future local commands. Contributors working on Composer itself can opt into a local package source explicitly.

`init` detects root and `src` application layouts. Override detection with `--source-root`, `--wrapper-root`, `--foundation-css`, or `--import-alias`. Pass `--components=Section,Button` for an on-demand wrapper set and add later components with `add --components=Money`. Use `inspect --used --compact`, `inspect --component=button`, `inspect --category=field`, or `report` for focused usage output.
