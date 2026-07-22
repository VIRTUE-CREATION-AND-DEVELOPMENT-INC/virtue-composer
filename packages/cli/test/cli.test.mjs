import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { componentRegistry } from "@virtuecreation/composer-registry";
import { add, doctor, init, inspect, upgrade } from "../src/index.js";

test("init creates a detectable Composer project", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "virtue-composer-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await writeFile(path.join(root, "package.json"), '{"name":"fixture","dependencies":{}}\n');
  await init(root);
  const result = await inspect(root);
  assert.equal(result.composerProject, true);
  assert.equal(result.components.length, 120);
  assert.match(await readFile(path.join(root, "src/components/composer/Button.js"), "utf8"), /@virtuecreation\/composer\/button/);
  const packageJson = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
  assert.equal(packageJson.dependencies["@virtuecreation/composer"], "0.4.0");
  assert.equal(packageJson.devDependencies["@virtuecreation/composer-cli"], "0.4.1");
  assert.equal(result.config.packageSource, "npm");
  const jsconfig = JSON.parse(await readFile(path.join(root, "jsconfig.json"), "utf8"));
  assert.deepEqual(jsconfig.compilerOptions.paths["@/components/composer"], ["./src/components/composer/index.js"]);
});

test("init detects a root app layout and writes compatible aliases", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "virtue-composer-root-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(path.join(root, "app"), { recursive: true });
  await writeFile(path.join(root, "package.json"), '{"name":"fixture","dependencies":{}}\n');
  await writeFile(path.join(root, "jsconfig.json"), '{"compilerOptions":{"paths":{"@/*":["./*"]}}}\n');
  const initialized = await init(root);
  assert.deepEqual(initialized.structure, { sourceRoot: ".", wrapperRoot: "components/composer", foundationCss: "styles/composer.css", importAlias: "@/components/composer", language: "jsx" });
  assert.match(await readFile(path.join(root, "components/composer/Button.js"), "utf8"), /@virtuecreation\/composer\/button/);
  const config = JSON.parse(await readFile(path.join(root, "virtue-composer.config.json"), "utf8"));
  assert.equal(config.sourceRoot, ".");
  assert.equal(config.wrapperRoot, "components/composer");
  const jsconfig = JSON.parse(await readFile(path.join(root, "jsconfig.json"), "utf8"));
  assert.deepEqual(jsconfig.compilerOptions.paths["@/components/composer"], ["./components/composer/index.js"]);
});

test("init accepts explicit structure and alias options", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "virtue-composer-options-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await writeFile(path.join(root, "package.json"), '{"name":"fixture","dependencies":{}}\n');
  await init(root, { sourceRoot: "web", wrapperRoot: "ui/composer", foundationCss: "ui/composer.css", importAlias: "~/composer" });
  const config = JSON.parse(await readFile(path.join(root, "virtue-composer.config.json"), "utf8"));
  assert.equal(config.sourceRoot, "web");
  assert.equal(config.wrapperRoot, "ui/composer");
  const jsconfig = JSON.parse(await readFile(path.join(root, "jsconfig.json"), "utf8"));
  assert.deepEqual(jsconfig.compilerOptions.paths["~/composer"], ["./ui/composer/index.js"]);
});

test("init and add support on-demand wrapper installation", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "virtue-composer-on-demand-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await writeFile(path.join(root, "package.json"), '{"name":"fixture","dependencies":{}}\n');
  await init(root, { components: "Section,Button" });
  const wrapperRoot = path.join(root, "src/components/composer");
  assert.equal((await readdir(wrapperRoot)).filter((file) => file !== "index.js").length, 2);
  assert.equal((await doctor(root)).ok, true);
  await add(root, "Money");
  assert.match(await readFile(path.join(wrapperRoot, "Money.js"), "utf8"), /@virtuecreation\/composer\/money/);
  const manifest = JSON.parse(await readFile(path.join(root, "virtue-composer.manifest.json"), "utf8"));
  assert.deepEqual(manifest.components.sort(), ["button", "money", "section"]);
});

test("init supports an explicit local development source", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "virtue-composer-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await writeFile(path.join(root, "package.json"), '{"name":"fixture","dependencies":{}}\n');
  await init(root, { source: "local" });
  const packageJson = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
  assert.match(packageJson.dependencies["@virtuecreation/composer"], /^file:/);
  const result = await inspect(root);
  assert.equal(result.config.packageSource, "local");
});

test("upgrade adds missing release phases without replacing customized wrappers", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "virtue-composer-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await writeFile(path.join(root, "package.json"), '{"name":"fixture","dependencies":{}}\n');
  await init(root);
  const wrapperRoot = path.join(root, "src/components/composer");
  await writeFile(path.join(wrapperRoot, "Button.js"), '// project customization\nexport { default } from "@virtuecreation/composer/button";\n');
  for (const component of componentRegistry.slice(19)) await rm(path.join(wrapperRoot, `${component.projectImport.split("/").at(-1)}.js`));
  const cssFile = path.join(root, "src/styles/composer.css");
  const css = await readFile(cssFile, "utf8");
  await writeFile(cssFile, css.replace(/\/\* vc:phase-(\d+):start \*\/[\s\S]*?\/\* vc:phase-\1:end \*\//g, "").trimEnd() + "\n");
  const manifestFile = path.join(root, "virtue-composer.manifest.json");
  const manifest = JSON.parse(await readFile(manifestFile, "utf8"));
  manifest.composerVersion = "0.1.0";
  manifest.components = manifest.components.slice(0, 19);
  await writeFile(manifestFile, `${JSON.stringify(manifest, null, 2)}\n`);
  await upgrade(root);
  assert.match(await readFile(path.join(wrapperRoot, "Button.js"), "utf8"), /project customization/);
  assert.match(await readFile(cssFile, "utf8"), /vc:phase-2:start/);
  assert.match(await readFile(cssFile, "utf8"), /vc:phase-3:start/);
  assert.match(await readFile(cssFile, "utf8"), /vc:phase-4:start/);
  const report = await doctor(root);
  assert.equal(report.ok, true);
});

test("doctor catches boundary violations", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "virtue-composer-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await init(root);
  await mkdir(path.join(root, "src/app"), { recursive: true });
  await writeFile(path.join(root, "src/app/page.jsx"), 'import Button from "@virtuecreation/composer/button";\nexport default function Page(){return <Section padding="large"><button>Bad</button></Section>}\n');
  const result = await doctor(root);
  assert.equal(result.ok, false);
  assert.deepEqual(result.findings.filter((item) => item.severity === "error").map((item) => item.rule).sort(), ["direct-package-import", "raw-button", "section-visual-prop"]);
});

test("doctor catches wrapper and manifest drift", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "virtue-composer-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await init(root);
  await rm(path.join(root, "src/components/composer/Button.js"));
  const manifestFile = path.join(root, "virtue-composer.manifest.json");
  const manifest = JSON.parse(await readFile(manifestFile, "utf8"));
  manifest.components.push("removed-component");
  await writeFile(manifestFile, `${JSON.stringify(manifest, null, 2)}\n`);
  const result = await doctor(root);
  assert.equal(result.ok, false);
  assert.deepEqual(result.findings.filter((item) => item.severity === "error").map((item) => item.rule).sort(), ["missing-wrapper", "unknown-manifest-component"]);
});

test("doctor honors enforcement severities and path exceptions", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "virtue-composer-enforcement-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await init(root);
  await mkdir(path.join(root, "src/app/legacy"), { recursive: true });
  await writeFile(path.join(root, "src/app/page.jsx"), 'export default function Page(){return <button>Warn</button>}\n');
  await writeFile(path.join(root, "src/app/legacy/page.jsx"), 'export default function Legacy(){return <button>Allowed</button>}\n');
  const configFile = path.join(root, "virtue-composer.config.json");
  const config = JSON.parse(await readFile(configFile, "utf8"));
  config.enforcement.rawControls = "warning";
  config.enforcement.exceptions = { rawControls: ["src/app/legacy/**"] };
  await writeFile(configFile, `${JSON.stringify(config, null, 2)}\n`);
  const result = await doctor(root);
  const raw = result.findings.filter((item) => item.rule === "raw-button");
  assert.equal(result.ok, true);
  assert.equal(raw.length, 1);
  assert.equal(raw[0].severity, "warning");
  assert.equal(raw[0].file, "src/app/page.jsx");
});

test("doctor detects CSS Module layout divs and forbidden Section style", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "virtue-composer-css-module-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await init(root);
  await mkdir(path.join(root, "src/app"), { recursive: true });
  await writeFile(path.join(root, "src/app/page.module.css"), ".frame { color: black; }\n.layout { display: grid; gap: 1rem; }\n");
  await writeFile(path.join(root, "src/app/page.jsx"), 'import { Section } from "@/components/composer";\nimport styles from "./page.module.css";\nexport default function Page(){return <><div className={styles.layout}>Layout</div><Section style={{ color: "red" }}>Bad</Section></>}\n');
  const result = await doctor(root);
  assert.equal(result.coverage.skippedFiles, 0);
  assert.deepEqual(result.findings.filter((item) => ["layout-div", "section-visual-prop", "section-explicit-element"].includes(item.rule)).map((item) => item.rule).sort(), ["layout-div", "section-explicit-element", "section-visual-prop"]);
});

test("inspect filters compact output and reports used components", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "virtue-composer-inspect-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await init(root);
  await mkdir(path.join(root, "src/app"), { recursive: true });
  await writeFile(path.join(root, "src/app/page.jsx"), 'import { Button, Section } from "@/components/composer";\nexport default function Page(){return <Section as="main"><Button>Ready</Button></Section>}\n');
  const used = await inspect(root, { used: true, compact: true });
  assert.deepEqual(used.components.map((component) => component.id).sort(), ["button", "section"]);
  assert.equal(used.summary.used, 2);
  assert.equal(used.summary.available, 120);
  const fields = await inspect(root, { category: "field", compact: true });
  assert.ok(fields.components.length > 10);
  assert.ok(fields.components.every((component) => component.layer === "field"));
  const button = await inspect(root, { component: "Button", compact: true });
  assert.deepEqual(button.components.map((component) => component.id), ["button"]);
});
