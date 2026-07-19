import { cp, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { componentRegistry, composerVersion, contractVersion } from "@virtuecreation/composer-registry";

const cliRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const templateRoot = path.join(cliRoot, "template/next-jsx");
const defaultLocalComposerPath = path.resolve(cliRoot, "../composer");
const composerPackageName = "@virtuecreation/composer";
const legacyComposerPackageName = "@virtue/composer";
const sourceExtensions = new Set([".js", ".jsx", ".ts", ".tsx"]);
const ignoredDirectories = new Set([".git", ".next", "dist", "node_modules", "coverage"]);
const visualSectionProps = ["surface", "width", "minWidth", "maxWidth", "height", "minHeight", "maxHeight", "padding", "background", "border", "radius", "shadow"];

async function readJson(file) {
  return JSON.parse(await readFile(file, "utf8"));
}

async function collectSourceFiles(directory) {
  if (!existsSync(directory)) return [];
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (ignoredDirectories.has(entry.name)) continue;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await collectSourceFiles(absolute)));
    else if (sourceExtensions.has(path.extname(entry.name))) files.push(absolute);
  }
  return files;
}

function findInstalledComposer(root) {
  let current = root;
  while (true) {
    for (const packageName of [composerPackageName, legacyComposerPackageName]) {
      const candidate = path.join(current, "node_modules", packageName, "package.json");
      if (existsSync(candidate)) return candidate;
    }
    const parent = path.dirname(current);
    if (parent === current) return null;
    current = parent;
  }
}

function position(source, index) {
  return source.slice(0, index).split("\n").length;
}

function finding(severity, rule, file, line, message) {
  return { severity, rule, file, line, message };
}

function inspectSource(source, relativeFile, isWrapper) {
  const findings = [];
  if (!isWrapper) {
    for (const match of source.matchAll(/from\s+["']@virtue(?:creation)?\/composer(?:\/[\w-]+)?["']/g)) {
      findings.push(finding("error", "direct-package-import", relativeFile, position(source, match.index), "Import Composer through the project wrapper layer."));
    }

    const rawControls = [
      [/<button\b/g, "button"],
      [/<textarea\b/g, "textarea"],
      [/<select\b/g, "select"],
      [/<input\b/g, "input"],
    ];
    for (const [pattern, element] of rawControls) {
      for (const match of source.matchAll(pattern)) {
        findings.push(finding("error", `raw-${element}`, relativeFile, position(source, match.index), `Use the local Composer ${element} wrapper.`));
      }
    }

    for (const match of source.matchAll(/<Section\b([^>]*)>/gs)) {
      for (const prop of visualSectionProps) {
        if (new RegExp(`\\b${prop}\\s*=`).test(match[1])) {
          findings.push(finding("error", "section-visual-prop", relativeFile, position(source, match.index), `Section cannot own visual prop \"${prop}\"; move it to project CSS.`));
        }
      }
    }

    for (const match of source.matchAll(/<div\b[^>]*(?:className\s*=\s*["'][^"']*\b(?:flex|grid)[^"']*["']|style\s*=\s*\{\{[^}]*display\s*:\s*["'](?:flex|grid)["'])[^>]*>/gs)) {
      findings.push(finding("warning", "layout-div", relativeFile, position(source, match.index), "Consider Section for this layout-bearing div."));
    }
  }
  return findings;
}

export async function doctor(projectDirectory = ".") {
  const root = path.resolve(projectDirectory);
  const configFile = path.join(root, "virtue-composer.config.json");
  const manifestFile = path.join(root, "virtue-composer.manifest.json");
  const findings = [];
  let config;
  let manifest;

  if (!existsSync(configFile)) findings.push(finding("error", "missing-config", "virtue-composer.config.json", 1, "Run virtue-composer init to create project configuration."));
  else config = await readJson(configFile);
  if (!existsSync(manifestFile)) findings.push(finding("error", "missing-manifest", "virtue-composer.manifest.json", 1, "Run virtue-composer init to create the component manifest."));
  else manifest = await readJson(manifestFile);

  if (config?.contractVersion !== contractVersion) findings.push(finding("error", "contract-version", "virtue-composer.config.json", 1, `Expected contractVersion ${contractVersion}.`));
  if (manifest?.contractVersion !== contractVersion) findings.push(finding("error", "manifest-version", "virtue-composer.manifest.json", 1, `Expected contractVersion ${contractVersion}.`));

  const wrapperRoot = config?.wrapperRoot ?? "src/components/composer";
  const foundationCss = config?.foundationCss ?? "src/styles/composer.css";
  const wrapperDirectory = path.join(root, wrapperRoot);
  if (!existsSync(wrapperDirectory)) findings.push(finding("error", "missing-wrappers", wrapperRoot, 1, "Composer wrapper directory is missing."));
  else {
    for (const component of componentRegistry) {
      const wrapperName = component.projectImport.split("/").at(-1);
      const hasWrapper = [".js", ".jsx", ".ts", ".tsx"].some((extension) => existsSync(path.join(wrapperDirectory, `${wrapperName}${extension}`)));
      if (!hasWrapper) findings.push(finding("error", "missing-wrapper", wrapperRoot, 1, `Missing local wrapper for ${component.title}.`));
    }
  }
  if (manifest) {
    for (const component of componentRegistry) {
      if (!manifest.components?.includes(component.id)) findings.push(finding("error", "missing-manifest-component", "virtue-composer.manifest.json", 1, `Manifest is missing ${component.id}.`));
    }
  }
  const installedPackage = findInstalledComposer(root);
  if (installedPackage && manifest?.composerVersion) {
    const installedVersion = (await readJson(installedPackage)).version;
    if (installedVersion !== manifest.composerVersion) findings.push(finding("error", "composer-version", path.relative(root, installedPackage), 1, `Installed Composer ${installedVersion} does not match manifest ${manifest.composerVersion}.`));
  }
  if (!existsSync(path.join(root, foundationCss))) findings.push(finding("error", "missing-foundation-css", foundationCss, 1, "Composer foundation CSS is missing."));

  const sourceRoot = path.join(root, config?.sourceRoot ?? "src");
  const files = await collectSourceFiles(sourceRoot);
  let foundationReferenced = false;
  for (const file of files) {
    const source = await readFile(file, "utf8");
    const relative = path.relative(root, file).split(path.sep).join("/");
    const normalizedWrapper = wrapperRoot.split(path.sep).join("/");
    const isWrapper = relative === normalizedWrapper || relative.startsWith(`${normalizedWrapper}/`);
    if (source.includes(path.basename(foundationCss))) foundationReferenced = true;
    findings.push(...inspectSource(source, relative, isWrapper));
  }
  if (files.length > 0 && existsSync(path.join(root, foundationCss)) && !foundationReferenced) {
    findings.push(finding("warning", "foundation-css-import", foundationCss, 1, "Import the Composer foundation CSS once from the app root."));
  }

  return {
    ok: !findings.some((item) => item.severity === "error"),
    project: root,
    contractVersion,
    scannedFiles: files.length,
    summary: {
      errors: findings.filter((item) => item.severity === "error").length,
      warnings: findings.filter((item) => item.severity === "warning").length,
    },
    findings,
  };
}

function localDependency(localPath) {
  const resolved = path.resolve(localPath ?? defaultLocalComposerPath);
  if (!existsSync(path.join(resolved, "package.json"))) throw new Error(`Local Composer package not found at ${resolved}. Pass --local=/absolute/path/to/packages/composer.`);
  return `file:${resolved}`;
}

function dependencySpec({ source = "npm", localPath, dependency } = {}) {
  if (dependency) return dependency;
  return source === "local" ? localDependency(localPath) : composerVersion;
}

async function writePackageSourceConfig(root, source) {
  const configFile = path.join(root, "virtue-composer.config.json");
  if (!existsSync(configFile)) return;
  const config = await readJson(configFile);
  await writeFile(configFile, `${JSON.stringify({ ...config, packageName: composerPackageName, packageSource: source }, null, 2)}\n`);
}

export async function init(projectDirectory = ".", { force = false, source = "npm", localPath, dependency } = {}) {
  const root = path.resolve(projectDirectory);
  await mkdir(root, { recursive: true });
  const entries = ["virtue-composer.config.json", "virtue-composer.manifest.json", "src/components/composer", "src/styles/composer.css"];
  const written = [];
  const skipped = [];
  for (const entry of entries) {
    const source = path.join(templateRoot, entry);
    const destination = path.join(root, entry);
    if (existsSync(destination) && !force) {
      skipped.push(entry);
      continue;
    }
    await mkdir(path.dirname(destination), { recursive: true });
    await cp(source, destination, { recursive: true, force: true });
    written.push(entry);
  }
  await writePackageSourceConfig(root, source);

  const packageFile = path.join(root, "package.json");
  if (existsSync(packageFile)) {
    const packageJson = await readJson(packageFile);
    packageJson.dependencies ??= {};
    delete packageJson.dependencies[legacyComposerPackageName];
    packageJson.dependencies[composerPackageName] ??= dependencySpec({ source, localPath, dependency });
    await writeFile(packageFile, `${JSON.stringify(packageJson, null, 2)}\n`);
    written.push("package.json dependency");
  }
  const install = source === "local" ? "Run npm install --install-links." : "Run npm install.";
  return { ok: true, project: root, source, dependency: dependencySpec({ source, localPath, dependency }), written, skipped, next: ["Import src/styles/composer.css from the app root.", install, "Run virtue-composer doctor."] };
}

export async function upgrade(projectDirectory = ".", { source, localPath, dependency } = {}) {
  const root = path.resolve(projectDirectory);
  const configFile = path.join(root, "virtue-composer.config.json");
  if (!existsSync(configFile)) throw new Error("Virtue Composer is not initialized. Run virtue-composer init first.");
  const config = await readJson(configFile);
  const wrapperRoot = path.join(root, config.wrapperRoot ?? "src/components/composer");
  const foundationFile = path.join(root, config.foundationCss ?? "src/styles/composer.css");
  const written = [];
  const skipped = [];
  await mkdir(wrapperRoot, { recursive: true });
  let migratedWrapperImports = false;

  for (const component of componentRegistry) {
    const wrapperName = component.projectImport.split("/").at(-1);
    const existingFile = [".js", ".jsx", ".ts", ".tsx"].map((extension) => path.join(wrapperRoot, `${wrapperName}${extension}`)).find(existsSync);
    const exists = Boolean(existingFile);
    if (exists) {
      const currentWrapper = await readFile(existingFile, "utf8");
      const migratedWrapper = currentWrapper.replaceAll(legacyComposerPackageName, composerPackageName);
      if (migratedWrapper !== currentWrapper) {
        await writeFile(existingFile, migratedWrapper);
        migratedWrapperImports = true;
      }
      skipped.push(`${wrapperName} wrapper`);
      continue;
    }
    await cp(path.join(templateRoot, "src/components/composer", `${wrapperName}.js`), path.join(wrapperRoot, `${wrapperName}.js`));
    written.push(`${wrapperName} wrapper`);
  }
  if (migratedWrapperImports) written.push("wrapper package scope migration");

  const sourceIndex = await readFile(path.join(templateRoot, "src/components/composer/index.js"), "utf8");
  const targetIndex = path.join(wrapperRoot, "index.js");
  let targetIndexSource = existsSync(targetIndex) ? await readFile(targetIndex, "utf8") : "";
  const missingExports = sourceIndex.split("\n").filter((line) => line && !targetIndexSource.includes(line.match(/from "(.*)"/)?.[1] ?? line));
  if (missingExports.length > 0) {
    targetIndexSource = `${targetIndexSource.trimEnd()}${targetIndexSource.trim() ? "\n" : ""}${missingExports.join("\n")}\n`;
    await writeFile(targetIndex, targetIndexSource);
    written.push("wrapper index exports");
  }

  const templateFoundation = await readFile(path.join(templateRoot, "src/styles/composer.css"), "utf8");
  const currentFoundation = existsSync(foundationFile) ? await readFile(foundationFile, "utf8") : "";
  const phaseBlocks = [...templateFoundation.matchAll(/\/\* vc:phase-(\d+):start \*\/[\s\S]*?\/\* vc:phase-\1:end \*\//g)];
  if (phaseBlocks.length === 0) throw new Error("No marked foundation blocks exist in the Composer template.");
  let nextFoundation = currentFoundation;
  for (const match of phaseBlocks) {
    const phase = match[1];
    const label = `Phase ${phase} foundation CSS`;
    if (nextFoundation.includes(`vc:phase-${phase}:start`)) skipped.push(label);
    else {
      nextFoundation = `${nextFoundation.trimEnd()}${nextFoundation.trim() ? "\n\n" : ""}${match[0]}\n`;
      written.push(label);
    }
  }
  if (nextFoundation !== currentFoundation) {
    await mkdir(path.dirname(foundationFile), { recursive: true });
    await writeFile(foundationFile, nextFoundation);
  }

  const manifestFile = path.join(root, "virtue-composer.manifest.json");
  const templateManifest = await readJson(path.join(templateRoot, "virtue-composer.manifest.json"));
  const manifest = existsSync(manifestFile) ? await readJson(manifestFile) : {};
  const nextManifest = { ...manifest, contractVersion, composerVersion: templateManifest.composerVersion, template: manifest.template ?? "next-jsx", components: componentRegistry.map((component) => component.id) };
  await writeFile(manifestFile, `${JSON.stringify(nextManifest, null, 2)}\n`);
  written.push("virtue-composer.manifest.json");

  const packageFile = path.join(root, "package.json");
  if (existsSync(packageFile)) {
    const packageJson = await readJson(packageFile);
    packageJson.dependencies ??= {};
    const currentDependency = packageJson.dependencies[composerPackageName] ?? packageJson.dependencies[legacyComposerPackageName];
    const resolvedSource = source ?? config.packageSource ?? (currentDependency?.startsWith("file:") ? "local" : "npm");
    const nextDependency = dependency ?? (resolvedSource === "local" && currentDependency?.startsWith("file:") ? currentDependency : dependencySpec({ source: resolvedSource, localPath }));
    delete packageJson.dependencies[legacyComposerPackageName];
    packageJson.dependencies[composerPackageName] = nextDependency;
    await writeFile(packageFile, `${JSON.stringify(packageJson, null, 2)}\n`);
    await writePackageSourceConfig(root, resolvedSource);
    written.push("package.json dependency");
  }
  return { ok: true, project: root, written, skipped, next: ["Run npm install.", "Run virtue-composer doctor.", "Run the project lint, typecheck, tests, and build."] };
}

export async function inspect(projectDirectory = ".") {
  const root = path.resolve(projectDirectory);
  const configFile = path.join(root, "virtue-composer.config.json");
  return {
    project: root,
    composerProject: existsSync(configFile),
    config: existsSync(configFile) ? await readJson(configFile) : null,
    contractVersion,
    components: componentRegistry,
  };
}

function printHuman(command, result) {
  if (command === "doctor") {
    console.log(`Virtue Composer Doctor: ${result.ok ? "PASS" : "FAIL"}`);
    console.log(`${result.scannedFiles} files | ${result.summary.errors} errors | ${result.summary.warnings} warnings`);
    for (const item of result.findings) console.log(`${item.severity.toUpperCase()} ${item.rule} ${item.file}:${item.line} ${item.message}`);
    return;
  }
  if (command === "inspect") {
    console.log(`Virtue Composer ${result.composerProject ? "detected" : "not detected"} at ${result.project}`);
    console.log(`${result.components.length} registered components | contract v${result.contractVersion}`);
    for (const component of result.components) console.log(`${component.id.padEnd(18)} ${component.projectImport}`);
    return;
  }
  console.log(`Virtue Composer ${command === "upgrade" ? "upgraded" : "initialized"} at ${result.project}`);
  if (result.written.length) console.log(`Written: ${result.written.join(", ")}`);
  if (result.skipped.length) console.log(`Skipped: ${result.skipped.join(", ")}`);
  for (const step of result.next) console.log(`Next: ${step}`);
}

export async function run(argv) {
  const command = argv.find((arg) => !arg.startsWith("-")) ?? "help";
  const commandIndex = argv.indexOf(command);
  const directory = argv.slice(commandIndex + 1).find((arg) => !arg.startsWith("-")) ?? ".";
  const json = argv.includes("--json");
  const force = argv.includes("--force");
  const localOption = argv.find((arg) => arg === "--local" || arg.startsWith("--local="));
  const localPath = localOption?.includes("=") ? localOption.slice(localOption.indexOf("=") + 1) : undefined;
  const source = localOption ? "local" : argv.includes("--npm") ? "npm" : undefined;
  if (!["init", "upgrade", "inspect", "doctor"].includes(command)) {
    console.log("Usage: virtue-composer <init|upgrade|inspect|doctor> [project] [--npm|--local[=/path]] [--json] [--force]");
    return;
  }
  const result = command === "init" ? await init(directory, { force, source: source ?? "npm", localPath }) : command === "upgrade" ? await upgrade(directory, { source, localPath }) : command === "inspect" ? await inspect(directory) : await doctor(directory);
  if (json) console.log(JSON.stringify(result, null, 2));
  else printHuman(command, result);
  if (command === "doctor" && !result.ok) process.exitCode = 1;
}
