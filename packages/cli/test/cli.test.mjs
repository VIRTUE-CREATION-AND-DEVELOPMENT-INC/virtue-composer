import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { componentRegistry } from "@virtuecreation/composer-registry";
import { doctor, init, inspect, upgrade } from "../src/index.js";

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
  assert.equal(result.config.packageSource, "npm");
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
  manifest.components = manifest.components.filter((id) => id !== "button");
  await writeFile(manifestFile, `${JSON.stringify(manifest, null, 2)}\n`);
  const result = await doctor(root);
  assert.equal(result.ok, false);
  assert.deepEqual(result.findings.filter((item) => item.severity === "error").map((item) => item.rule).sort(), ["missing-manifest-component", "missing-wrapper"]);
});
