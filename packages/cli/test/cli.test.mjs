import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { componentRegistry } from "@virtuecreation/composer-registry";
import { add, compose, doctor, init, inspect, inspectCompositions, upgrade } from "../src/index.js";

test("init creates a detectable Composer project", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "virtue-composer-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await writeFile(path.join(root, "package.json"), '{"name":"fixture","dependencies":{}}\n');
  await init(root);
  const result = await inspect(root);
  assert.equal(result.composerProject, true);
  assert.equal(result.components.length, 128);
  assert.match(await readFile(path.join(root, "src/components/composer/Button.js"), "utf8"), /@virtuecreation\/composer\/button/);
  const packageJson = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
  assert.equal(packageJson.dependencies["@virtuecreation/composer"], "0.6.0");
  assert.equal(packageJson.devDependencies["@virtuecreation/composer-cli"], "0.6.0");
  assert.equal(packageJson.scripts["composer:check"], "virtue-composer doctor . --strict");
  assert.equal(result.config.packageSource, "npm");
  assert.equal(result.config.compositionRoot, "src/components/compositions");
  assert.equal(result.config.enforcement.componentSelection, "warning");
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
  assert.deepEqual(initialized.structure, { sourceRoot: ".", wrapperRoot: "components/composer", compositionRoot: "components/compositions", foundationCss: "styles/composer.css", importAlias: "@/components/composer", language: "jsx" });
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
  assert.equal(used.summary.available, 128);
  const fields = await inspect(root, { category: "field", compact: true });
  assert.ok(fields.components.length > 10);
  assert.ok(fields.components.every((component) => component.layer === "field"));
  const button = await inspect(root, { component: "Button", compact: true });
  assert.deepEqual(button.components.map((component) => component.id), ["button"]);
  assert.equal(button.components[0].stability, "stable");
  assert.equal(button.components[0].since, "0.1.0");
  const emptyState = await inspect(root, { component: "EmptyState" });
  assert.equal(emptyState.components[0].propContracts.actions.kind, "react-node");
});

test("report exposes per-file usage and registry-driven replacement candidates", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "virtue-composer-candidates-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await init(root);
  await mkdir(path.join(root, "src/app"), { recursive: true });
  await writeFile(path.join(root, "src/app/page.jsx"), `
    import { Form, Input, Money, Section, SegmentedControl } from "@/components/composer";
    export default function Page({ priceMinor }) {
      return <Section as="main"><Form fields={[]}><Input type="tel" /><Input type="number" /><Input type="password" /><SegmentedControl items={[]} /><p role="status">Saved</p><Money value={priceMinor / 100} currency="CAD" /></Form></Section>;
    }
  `);
  const report = await inspect(root, { used: true, compact: true, candidates: true, files: true });
  assert.equal(report.files.length, 1);
  assert.deepEqual(report.files[0].components.sort(), ["Form", "Input", "Money", "Section", "SegmentedControl"]);
  assert.deepEqual(report.candidates.map((candidate) => candidate.recommendation.id).sort(), ["inline-message", "money", "number-input", "password-input", "phone-input", "radio-group"]);
  assert.ok(report.candidates.every((candidate) => candidate.recommendation.status.installed));
  assert.ok(report.candidates.every((candidate) => candidate.recommendation.addCommand === null));
  const normal = await doctor(root);
  assert.equal(normal.ok, true);
  assert.equal(normal.findings.filter((finding) => finding.rule.startsWith("prefer-")).length, 6);
  const strict = await doctor(root, { strict: true });
  assert.equal(strict.ok, false);
  assert.equal(strict.strict, true);
});

test("composition catalog supports natural-language discovery", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "virtue-composer-composition-inspect-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await writeFile(path.join(root, "package.json"), '{"name":"fixture","dependencies":{}}\n');
  await init(root, { components: "Section" });
  const result = await inspectCompositions(root, { query: "impact statistics", compact: true });
  assert.equal(result.summary.availableCompositions, 34);
  assert.equal(result.summary.availableBlueprints, 3);
  assert.deepEqual(result.compositions.map((composition) => composition.id), ["proof-metric-strip"]);
  assert.equal(result.compositions[0].status.installed, false);
  const community = await inspectCompositions(root, { blueprint: "community-nonprofit", compact: true });
  assert.deepEqual(community.blueprints.map((blueprint) => blueprint.id), ["community-nonprofit"]);
  const guided = await inspectCompositions(root, { pack: "guided-workflows", compact: true });
  assert.deepEqual(guided.compositions.map((composition) => composition.id), ["multi-step-selection-flow", "estimate-flow", "booking-flow"]);
  assert.ok(guided.compositions.every((composition) => composition.pack === "guided-workflows"));
});

test("compose copies project-owned JSX and CSS, installs dependencies, and preserves adaptations", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "virtue-composer-compose-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await writeFile(path.join(root, "package.json"), '{"name":"fixture","dependencies":{}}\n');
  await init(root, { components: "Section" });
  const first = await compose(root, { compositions: "faq-split-accordion,proof-metric-strip" });
  assert.deepEqual(first.compositions, ["faq-split-accordion", "proof-metric-strip"]);
  const compositionRoot = path.join(root, "src/components/compositions");
  assert.match(await readFile(path.join(compositionRoot, "FAQSplitAccordion.jsx"), "utf8"), /from "@\/components\/composer"/);
  assert.match(await readFile(path.join(compositionRoot, "compositions.module.css"), "utf8"), /\.section/);
  const manifestFile = path.join(root, "virtue-composer.manifest.json");
  const manifest = JSON.parse(await readFile(manifestFile, "utf8"));
  assert.deepEqual(manifest.compositions.sort(), ["faq-split-accordion", "proof-metric-strip"]);
  assert.ok(manifest.components.includes("accordion"));
  assert.ok(manifest.components.includes("button-link"));
  assert.equal((await doctor(root)).ok, true);

  await writeFile(path.join(compositionRoot, "FAQSplitAccordion.jsx"), "// project adaptation\n");
  const second = await compose(root, { compositions: "faq-split-accordion" });
  assert.ok(second.skipped.includes("FAQ split accordion composition"));
  assert.equal(await readFile(path.join(compositionRoot, "FAQSplitAccordion.jsx"), "utf8"), "// project adaptation\n");
});

test("compose installs complete page blueprints and Doctor detects missing copied files", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "virtue-composer-blueprint-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await writeFile(path.join(root, "package.json"), '{"name":"fixture","dependencies":{}}\n');
  await init(root, { components: "Section" });
  await mkdir(path.join(root, "src/app"), { recursive: true });
  await writeFile(path.join(root, "src/app/layout.jsx"), 'import "../styles/composer.css";\nexport default function Layout({ children }) { return <html><body>{children}</body></html>; }\n');
  const result = await compose(root, { blueprint: "service-business" });
  assert.equal(result.blueprint, "service-business");
  assert.deepEqual(result.compositions, ["services-media-grid", "content-media-split", "proof-metric-strip", "process-numbered-steps", "location-contact-cards", "faq-split-accordion", "contact-form-split"]);
  const manifest = JSON.parse(await readFile(path.join(root, "virtue-composer.manifest.json"), "utf8"));
  assert.deepEqual(manifest.blueprints, ["service-business"]);
  assert.equal((await doctor(root, { strict: true })).ok, true);
  await rm(path.join(root, "src/components/compositions/ServicesMediaGrid.jsx"));
  const report = await doctor(root);
  assert.equal(report.ok, false);
  assert.ok(report.findings.some((finding) => finding.rule === "missing-composition"));
});

test("compose installs a complete specialized composition pack", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "virtue-composer-pack-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await writeFile(path.join(root, "package.json"), '{"name":"fixture","dependencies":{}}\n');
  await init(root, { components: "Section" });
  const result = await compose(root, { pack: "immersive" });
  assert.equal(result.pack, "immersive");
  assert.deepEqual(result.compositions, ["horizontal-story", "chaptered-presentation"]);
  const manifest = JSON.parse(await readFile(path.join(root, "virtue-composer.manifest.json"), "utf8"));
  assert.ok(manifest.components.includes("anchor-nav"));
  assert.ok(manifest.compositions.includes("horizontal-story"));
  assert.ok(manifest.compositions.includes("chaptered-presentation"));
  assert.equal((await doctor(root)).ok, true);
});
