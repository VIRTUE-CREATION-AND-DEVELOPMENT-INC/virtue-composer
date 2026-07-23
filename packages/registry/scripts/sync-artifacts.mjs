import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import coreComponents from "../components.json" with { type: "json" };
import phaseThreeComponents from "../components.phase-3.json" with { type: "json" };
import phaseFourComponents from "../components.phase-4.json" with { type: "json" };
import phaseFiveComponents from "../components.phase-5.json" with { type: "json" };
import compositions from "../compositions.json" with { type: "json" };
import blueprints from "../blueprints.json" with { type: "json" };

const components = [...coreComponents, ...phaseThreeComponents, ...phaseFourComponents, ...phaseFiveComponents];

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const composerPackage = JSON.parse(await readFile(path.join(root, "packages/composer/package.json"), "utf8"));
const cliPackage = JSON.parse(await readFile(path.join(root, "packages/cli/package.json"), "utf8"));
const check = process.argv.includes("--check");
const cliTemplateRoot = path.join(root, "packages/cli/template/next-jsx");
const wrapperRoots = [path.join(root, "templates/next-jsx/src/components/composer"), path.join(root, "apps/showcase-jsx/src/components/composer"), path.join(cliTemplateRoot, "src/components/composer")];
const templateManifestFiles = [path.join(root, "templates/next-jsx/virtue-composer.manifest.json"), path.join(cliTemplateRoot, "virtue-composer.manifest.json")];
const showcaseManifestFile = path.join(root, "apps/showcase-jsx/virtue-composer.manifest.json");
const foundationSource = path.join(root, "templates/next-jsx/src/styles/composer.css");
const foundationTargets = [path.join(root, "apps/showcase-jsx/src/app/composer.css"), path.join(cliTemplateRoot, "src/styles/composer.css")];
const configSource = path.join(root, "templates/next-jsx/virtue-composer.config.json");
const configTarget = path.join(cliTemplateRoot, "virtue-composer.config.json");
const compositionTemplateRoot = path.join(root, "packages/registry/templates/compositions");
const cliCompositionRoot = path.join(cliTemplateRoot, "compositions");
const sandboxExampleRoot = path.join(root, "apps/showcase-jsx/src/app/sandbox/examples");
const composerIndexFile = path.join(root, "packages/composer/src/index.ts");
const composerPackageFile = path.join(root, "packages/composer/package.json");
const drift = [];

async function emit(file, content) {
  let current = null;
  try { current = await readFile(file, "utf8"); } catch {}
  if (current === content) return;
  if (check) {
    drift.push(path.relative(root, file));
    return;
  }
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, content);
}

const exports = [];
const composerExports = [];
const packageExports = { ".": { types: "./dist/index.d.ts", import: "./dist/index.js" } };
for (const component of components) {
  const name = component.projectImport.split("/").at(-1);
  const wrapper = component.id === "toast"
    ? `export { default, useToast } from "${component.packageImport}";\n`
    : `export { default } from "${component.packageImport}";\n`;
  for (const wrapperRoot of wrapperRoots) await emit(path.join(wrapperRoot, `${name}.js`), wrapper);
  exports.push(component.id === "toast" ? `export { default as ${name}, useToast } from "./${name}";` : `export { default as ${name} } from "./${name}";`);
  const rootName = component.id === "toast" ? "ToastProvider" : name;
  composerExports.push(`export { default as ${rootName} } from "./${name}";`, `export * from "./${name}";`);
  const subpath = component.packageImport.replace("@virtuecreation/composer", ".");
  packageExports[subpath] = { types: `./dist/${name}.d.ts`, import: `./dist/${name}.js` };
}

for (const wrapperRoot of wrapperRoots) await emit(path.join(wrapperRoot, "index.js"), `${exports.join("\n")}\n`);
await emit(composerIndexFile, `${composerExports.join("\n")}\n`);
await emit(composerPackageFile, `${JSON.stringify({ ...composerPackage, exports: packageExports }, null, 2)}\n`);

const manifestRecord = { contractVersion: 1, composerVersion: composerPackage.version, cliVersion: cliPackage.version, installationMode: "full", template: "next-jsx", components: components.map((component) => component.id), compositions: [], blueprints: [] };
const manifest = `${JSON.stringify(manifestRecord, null, 2)}\n`;
for (const manifestFile of templateManifestFiles) await emit(manifestFile, manifest);
await emit(showcaseManifestFile, `${JSON.stringify({ ...manifestRecord, compositions: compositions.map((composition) => composition.id), blueprints: blueprints.map((blueprint) => blueprint.id) }, null, 2)}\n`);
for (const foundationTarget of foundationTargets) await emit(foundationTarget, await readFile(foundationSource, "utf8"));
await emit(configTarget, await readFile(configSource, "utf8"));

const sharedCompositionStyle = await readFile(path.join(compositionTemplateRoot, "compositions.module.css"), "utf8");
for (const destination of [cliCompositionRoot, sandboxExampleRoot]) {
  await emit(path.join(destination, "compositions.module.css"), sharedCompositionStyle);
}
for (const composition of compositions) {
  const sourceName = path.basename(composition.template.source);
  const source = await readFile(path.join(compositionTemplateRoot, sourceName), "utf8");
  await emit(path.join(cliCompositionRoot, sourceName), source);
  await emit(path.join(sandboxExampleRoot, sourceName), source);
}
const exampleImports = compositions.map((composition) => `import ${composition.template.component} from "./${composition.template.component}";`);
const exampleEntries = compositions.map((composition) => `  "${composition.id}": ${composition.template.component},`);
await emit(path.join(sandboxExampleRoot, "index.js"), `${exampleImports.join("\n")}\n\nexport const compositionExamples = {\n${exampleEntries.join("\n")}\n};\n`);

if (drift.length > 0) {
  console.error(`Generated Composer artifacts are stale:\n${drift.map((file) => `- ${file}`).join("\n")}`);
  process.exit(1);
}
console.log(check ? `Generated artifacts current: ${components.length} components, ${compositions.length} compositions, ${blueprints.length} blueprints.` : `Generated artifacts synchronized: ${components.length} components, ${compositions.length} compositions, ${blueprints.length} blueprints.`);
