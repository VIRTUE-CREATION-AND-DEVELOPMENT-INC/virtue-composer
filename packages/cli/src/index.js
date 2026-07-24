import { cp, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { applyEdits, modify, parse as parseJsonc } from "jsonc-parser";
import { minimatch } from "minimatch";
import { blueprintRegistry, componentRegistry, componentStabilityEvidence, composerVersion, compositionRegistry, contractVersion } from "@virtuecreation/composer-registry";
import { analyzeSource, componentName } from "./analysis.js";

const cliRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const templateRoot = path.join(cliRoot, "template/next-jsx");
const defaultLocalComposerPath = path.resolve(cliRoot, "../composer");
const composerPackageName = "@virtuecreation/composer";
const legacyComposerPackageName = "@virtue/composer";
const cliPackageName = "@virtuecreation/composer-cli";
const cliVersion = JSON.parse(readFileSync(path.join(cliRoot, "package.json"), "utf8")).version;
const sourceExtensions = new Set([".js", ".jsx", ".ts", ".tsx"]);
const ignoredDirectories = new Set([".git", ".next", "dist", "node_modules", "coverage"]);
const enforcementDefaults = {
  directPackageImports: "error",
  rawControls: "error",
  sectionVisualProps: "error",
  sectionSemantics: "warning",
  layoutDivs: "warning",
  componentSelection: "warning",
  trustBoundaries: "off",
  sourceAnalysis: "warning",
};
const enforcementSeverities = new Set(["off", "warning", "error"]);
const selectionHints = componentRegistry.flatMap((target) => (target.selectionHints ?? []).map((hint) => ({ ...hint, target })));
const trustBoundaryHints = componentRegistry.flatMap((target) => (target.security?.doctorHints ?? []).map((hint) => ({ ...hint, from: componentName(target), target })));
const runtimeMethodology = {
  basis: "Unminified ESM bytes for the component's own TypeScript-compiled module.",
  excludes: ["transitive dependency bytes", "tree-shaking", "minification", "compression", "framework chunks", "consumer bundler behavior"],
  interpretation: "Use for relative planning and regression review, not as an exact consumer bundle prediction.",
};

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

function findInstalledPackage(root, packageNames) {
  let current = root;
  while (true) {
    for (const packageName of packageNames) {
      const candidate = path.join(current, "node_modules", packageName, "package.json");
      if (existsSync(candidate)) return candidate;
    }
    const parent = path.dirname(current);
    if (parent === current) return null;
    current = parent;
  }
}

function finding(severity, rule, file, line, message) {
  return { severity, rule, file, line, message };
}

function configuredFinding(raw, config) {
  const enforcement = config?.enforcement ?? {};
  const severity = enforcement[raw.group] ?? enforcementDefaults[raw.group] ?? "warning";
  const exceptions = enforcement.exceptions?.[raw.group] ?? [];
  if (severity === "off" || exceptions.some((pattern) => minimatch(raw.file, pattern, { dot: true }))) return null;
  return finding(severity, raw.rule, raw.file, raw.line, raw.message);
}

function validateEnforcement(config) {
  const findings = [];
  const enforcement = config?.enforcement;
  if (!enforcement || typeof enforcement !== "object") return findings;
  for (const [key, value] of Object.entries(enforcement)) {
    if (key === "exceptions") continue;
    if (!(key in enforcementDefaults)) findings.push(finding("warning", "unknown-enforcement-rule", "virtue-composer.config.json", 1, `Unknown enforcement group "${key}".`));
    else if (!enforcementSeverities.has(value)) findings.push(finding("error", "invalid-enforcement-severity", "virtue-composer.config.json", 1, `Enforcement group "${key}" must be off, warning, or error.`));
  }
  if (enforcement.exceptions !== undefined) {
    if (!enforcement.exceptions || typeof enforcement.exceptions !== "object" || Array.isArray(enforcement.exceptions)) {
      findings.push(finding("error", "invalid-enforcement-exceptions", "virtue-composer.config.json", 1, "Enforcement exceptions must map rule groups to path glob arrays."));
    } else {
      for (const [key, patterns] of Object.entries(enforcement.exceptions)) {
        if (!(key in enforcementDefaults)) findings.push(finding("warning", "unknown-enforcement-exception", "virtue-composer.config.json", 1, `Unknown enforcement exception group "${key}".`));
        if (!Array.isArray(patterns) || patterns.some((pattern) => typeof pattern !== "string")) findings.push(finding("error", "invalid-enforcement-exceptions", "virtue-composer.config.json", 1, `Enforcement exceptions for "${key}" must be an array of path globs.`));
      }
    }
  }
  return findings;
}

export async function doctor(projectDirectory = ".", { strict = false } = {}) {
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
  findings.push(...validateEnforcement(config));

  const wrapperRoot = config?.wrapperRoot ?? "src/components/composer";
  const compositionRoot = config?.compositionRoot ?? "src/components/compositions";
  const foundationCss = config?.foundationCss ?? "src/styles/composer.css";
  const wrapperDirectory = path.join(root, wrapperRoot);
  const installedIds = new Set(manifest?.components ?? componentRegistry.map((component) => component.id));
  if (!existsSync(wrapperDirectory)) findings.push(finding("error", "missing-wrappers", wrapperRoot, 1, "Composer wrapper directory is missing."));
  else {
    for (const component of componentRegistry.filter((record) => installedIds.has(record.id))) {
      const wrapperName = component.projectImport.split("/").at(-1);
      const hasWrapper = [".js", ".jsx", ".ts", ".tsx"].some((extension) => existsSync(path.join(wrapperDirectory, `${wrapperName}${extension}`)));
      if (!hasWrapper) findings.push(finding("error", "missing-wrapper", wrapperRoot, 1, `Missing local wrapper for ${component.title}.`));
    }
  }
  if (manifest) {
    const knownIds = new Set(componentRegistry.map((component) => component.id));
    for (const id of manifest.components ?? []) if (!knownIds.has(id)) findings.push(finding("error", "unknown-manifest-component", "virtue-composer.manifest.json", 1, `Manifest references unknown component ${id}.`));
    const knownCompositionIds = new Set(compositionRegistry.map((composition) => composition.id));
    const knownBlueprintIds = new Set(blueprintRegistry.map((blueprint) => blueprint.id));
    for (const id of manifest.compositions ?? []) {
      const composition = compositionRegistry.find((record) => record.id === id);
      if (!knownCompositionIds.has(id)) findings.push(finding("error", "unknown-manifest-composition", "virtue-composer.manifest.json", 1, `Manifest references unknown composition ${id}.`));
      else if (!existsSync(path.join(root, compositionRoot, `${composition.template.component}.jsx`))) findings.push(finding("error", "missing-composition", compositionRoot, 1, `Missing copied composition ${composition.title}.`));
    }
    if ((manifest.compositions?.length ?? 0) > 0 && !existsSync(path.join(root, compositionRoot, "compositions.module.css"))) findings.push(finding("error", "missing-composition-styles", compositionRoot, 1, "Copied composition styles are missing."));
    for (const id of manifest.blueprints ?? []) {
      const blueprint = blueprintRegistry.find((record) => record.id === id);
      if (!knownBlueprintIds.has(id)) findings.push(finding("error", "unknown-manifest-blueprint", "virtue-composer.manifest.json", 1, `Manifest references unknown blueprint ${id}.`));
      else for (const compositionId of blueprint.sequence) if (!(manifest.compositions ?? []).includes(compositionId)) findings.push(finding("error", "incomplete-blueprint", "virtue-composer.manifest.json", 1, `Blueprint ${id} requires composition ${compositionId}.`));
    }
  }
  const installedPackage = findInstalledPackage(root, [composerPackageName, legacyComposerPackageName]);
  if (installedPackage && manifest?.composerVersion) {
    const installedVersion = (await readJson(installedPackage)).version;
    if (installedVersion !== manifest.composerVersion) findings.push(finding("error", "composer-version", path.relative(root, installedPackage), 1, `Installed Composer ${installedVersion} does not match manifest ${manifest.composerVersion}.`));
  }
  const installedCli = findInstalledPackage(root, [cliPackageName]);
  if (installedCli && manifest?.cliVersion) {
    const installedVersion = (await readJson(installedCli)).version;
    if (installedVersion !== manifest.cliVersion) findings.push(finding("error", "cli-version", path.relative(root, installedCli), 1, `Installed Composer CLI ${installedVersion} does not match manifest ${manifest.cliVersion}.`));
  }
  const packageFile = path.join(root, "package.json");
  if (existsSync(packageFile) && manifest?.cliVersion) {
    const packageJson = await readJson(packageFile);
    if (packageJson.devDependencies?.[cliPackageName] !== manifest.cliVersion && !packageJson.devDependencies?.[cliPackageName]?.startsWith("file:")) {
      findings.push(finding("error", "cli-dependency", "package.json", 1, `Declare ${cliPackageName} ${manifest.cliVersion} as a dev dependency so the local virtue-composer binary is available.`));
    }
  }
  if (!existsSync(path.join(root, foundationCss))) findings.push(finding("error", "missing-foundation-css", foundationCss, 1, "Composer foundation CSS is missing."));

  const sourceRoot = path.join(root, config?.sourceRoot ?? "src");
  const files = await collectSourceFiles(sourceRoot);
  let foundationReferenced = false;
  let parsedFiles = 0;
  const usedNames = new Set();
  for (const file of files) {
    const source = await readFile(file, "utf8");
    const relative = path.relative(root, file).split(path.sep).join("/");
    const normalizedWrapper = wrapperRoot.split(path.sep).join("/");
    const isWrapper = relative === normalizedWrapper || relative.startsWith(`${normalizedWrapper}/`);
    if (source.includes(path.basename(foundationCss))) foundationReferenced = true;
    const analysis = await analyzeSource({ source, absoluteFile: file, relativeFile: relative, isWrapper, importAlias: config?.importAlias ?? "@/components/composer", selectionHints, trustBoundaryHints });
    if (analysis.parsed) parsedFiles += 1;
    for (const name of analysis.usedNames) usedNames.add(name);
    for (const raw of analysis.findings) {
      const configured = configuredFinding(raw, config);
      if (configured) findings.push(configured);
    }
  }
  if (files.length > 0 && existsSync(path.join(root, foundationCss)) && !foundationReferenced) {
    findings.push(finding("warning", "foundation-css-import", foundationCss, 1, "Import the Composer foundation CSS once from the app root."));
  }

  return {
    ok: !findings.some((item) => item.severity === "error" || (strict && item.severity === "warning")),
    strict,
    project: root,
    contractVersion,
    scannedFiles: files.length,
    coverage: { parsedFiles, skippedFiles: files.length - parsedFiles, layoutDetection: "AST with advisory CSS Module resolution" },
    usage: { usedComponents: [...usedNames].sort(), count: usedNames.size },
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
  const sourceRoot = config.sourceRoot ?? "src";
  const prefix = sourceRoot === "." ? "" : `${sourceRoot}/`;
  const enforcement = { ...enforcementDefaults, ...config.enforcement, exceptions: config.enforcement?.exceptions ?? {} };
  await writeFile(configFile, `${JSON.stringify({ ...config, compositionRoot: config.compositionRoot ?? `${prefix}components/compositions`, packageName: composerPackageName, packageSource: source, enforcement }, null, 2)}\n`);
}

function projectPath(value, label) {
  const normalized = value.split(path.sep).join("/").replace(/^\.\//, "").replace(/\/$/, "") || ".";
  if (path.isAbsolute(value) || normalized === ".." || normalized.startsWith("../")) throw new Error(`${label} must stay within the project root.`);
  return normalized;
}

function detectStructure(root, options = {}) {
  const hasRootRouter = existsSync(path.join(root, "app")) || existsSync(path.join(root, "pages"));
  const hasSrcRouter = existsSync(path.join(root, "src/app")) || existsSync(path.join(root, "src/pages"));
  const sourceRoot = projectPath(options.sourceRoot ?? (hasRootRouter && !hasSrcRouter ? "." : "src"), "sourceRoot");
  const prefix = sourceRoot === "." ? "" : `${sourceRoot}/`;
  return {
    sourceRoot,
    wrapperRoot: projectPath(options.wrapperRoot ?? `${prefix}components/composer`, "wrapperRoot"),
    compositionRoot: projectPath(options.compositionRoot ?? `${prefix}components/compositions`, "compositionRoot"),
    foundationCss: projectPath(options.foundationCss ?? `${prefix}styles/composer.css`, "foundationCss"),
    importAlias: options.importAlias ?? "@/components/composer",
    language: options.language ?? (existsSync(path.join(root, "tsconfig.json")) ? "tsx" : "jsx"),
  };
}

function resolveComponents(value, { allByDefault = true } = {}) {
  if (!value) return allByDefault ? [...componentRegistry] : [];
  const requested = Array.isArray(value) ? value : value.split(",").map((item) => item.trim()).filter(Boolean);
  const resolved = [];
  for (const query of requested) {
    const normalized = query.toLowerCase();
    const component = componentRegistry.find((record) => [record.id, record.title, componentName(record)].some((candidate) => candidate.toLowerCase() === normalized));
    if (!component) throw new Error(`Unknown Composer component "${query}". Run virtue-composer inspect --compact to list available components.`);
    if (!resolved.some((record) => record.id === component.id)) resolved.push(component);
  }
  return resolved;
}

async function writeWrappers(root, wrapperRoot, components, { force = false, append = false } = {}) {
  const destination = path.join(root, wrapperRoot);
  await mkdir(destination, { recursive: true });
  const written = [];
  const skipped = [];
  for (const component of components) {
    const name = componentName(component);
    const target = path.join(destination, `${name}.js`);
    if (existsSync(target) && !force) skipped.push(`${name} wrapper`);
    else {
      await cp(path.join(templateRoot, "src/components/composer", `${name}.js`), target, { force: true });
      written.push(`${name} wrapper`);
    }
  }
  const templateIndex = await readFile(path.join(templateRoot, "src/components/composer/index.js"), "utf8");
  const selectedNames = new Set(components.map(componentName));
  const selectedExports = templateIndex.split("\n").filter((line) => {
    const name = line.match(/from "\.\/(.*)"/)?.[1];
    return name && selectedNames.has(name);
  });
  const indexFile = path.join(destination, "index.js");
  const currentIndex = append && existsSync(indexFile) ? await readFile(indexFile, "utf8") : "";
  const missing = selectedExports.filter((line) => !currentIndex.includes(line));
  if (!existsSync(indexFile) || !append || missing.length > 0) {
    const next = append ? `${currentIndex.trimEnd()}${currentIndex.trim() && missing.length ? "\n" : ""}${missing.join("\n")}\n` : `${selectedExports.join("\n")}\n`;
    await writeFile(indexFile, next);
    written.push("wrapper index exports");
  }
  return { written, skipped };
}

async function ensureImportAlias(root, importAlias, wrapperRoot) {
  const configName = existsSync(path.join(root, "tsconfig.json")) ? "tsconfig.json" : existsSync(path.join(root, "jsconfig.json")) ? "jsconfig.json" : "jsconfig.json";
  const configFile = path.join(root, configName);
  let source = existsSync(configFile) ? await readFile(configFile, "utf8") : "{}\n";
  const current = parseJsonc(source) ?? {};
  const entries = [
    [["compilerOptions", "baseUrl"], current.compilerOptions?.baseUrl ?? "."],
    [["compilerOptions", "paths", importAlias], [`./${wrapperRoot}/index.js`]],
    [["compilerOptions", "paths", `${importAlias}/*`], [`./${wrapperRoot}/*`]],
  ];
  for (const [jsonPath, value] of entries) {
    const edits = modify(source, jsonPath, value, { formattingOptions: { insertSpaces: true, tabSize: 2, eol: "\n" } });
    source = applyEdits(source, edits);
  }
  await writeFile(configFile, source.endsWith("\n") ? source : `${source}\n`);
  return configName;
}

function cliDependency(source) {
  return source === "local" ? `file:${cliRoot}` : cliVersion;
}

export async function init(projectDirectory = ".", { force = false, source = "npm", localPath, dependency, sourceRoot, wrapperRoot, compositionRoot, foundationCss, importAlias, language, components } = {}) {
  const root = path.resolve(projectDirectory);
  await mkdir(root, { recursive: true });
  const written = [];
  const skipped = [];
  const configFile = path.join(root, "virtue-composer.config.json");
  const existingConfig = existsSync(configFile) && !force ? await readJson(configFile) : null;
  const structure = existingConfig ?? detectStructure(root, { sourceRoot, wrapperRoot, compositionRoot, foundationCss, importAlias, language });
  const templateConfig = await readJson(path.join(templateRoot, "virtue-composer.config.json"));
  const config = { ...templateConfig, ...structure, packageName: composerPackageName, packageSource: source };
  const selectedComponents = resolveComponents(components);

  if (existingConfig) skipped.push("virtue-composer.config.json");
  else {
    await writeFile(configFile, `${JSON.stringify(config, null, 2)}\n`);
    written.push("virtue-composer.config.json");
  }

  const manifestFile = path.join(root, "virtue-composer.manifest.json");
  if (existsSync(manifestFile) && !force) skipped.push("virtue-composer.manifest.json");
  else {
    const manifest = await readJson(path.join(templateRoot, "virtue-composer.manifest.json"));
    await writeFile(manifestFile, `${JSON.stringify({ ...manifest, cliVersion, installationMode: components ? "selected" : "full", components: selectedComponents.map((component) => component.id) }, null, 2)}\n`);
    written.push("virtue-composer.manifest.json");
  }

  const wrappers = await writeWrappers(root, structure.wrapperRoot, selectedComponents, { force, append: !force && existsSync(path.join(root, structure.wrapperRoot, "index.js")) });
  written.push(...wrappers.written);
  skipped.push(...wrappers.skipped);
  const foundationDestination = path.join(root, structure.foundationCss);
  if (existsSync(foundationDestination) && !force) skipped.push(structure.foundationCss);
  else {
    await mkdir(path.dirname(foundationDestination), { recursive: true });
    await cp(path.join(templateRoot, "src/styles/composer.css"), foundationDestination, { force: true });
    written.push(structure.foundationCss);
  }
  await writePackageSourceConfig(root, source);
  const aliasConfig = await ensureImportAlias(root, structure.importAlias, structure.wrapperRoot);
  written.push(`${aliasConfig} Composer alias`);

  const packageFile = path.join(root, "package.json");
  if (existsSync(packageFile)) {
    const packageJson = await readJson(packageFile);
    packageJson.dependencies ??= {};
    packageJson.devDependencies ??= {};
    packageJson.scripts ??= {};
    delete packageJson.dependencies[legacyComposerPackageName];
    packageJson.dependencies[composerPackageName] ??= dependencySpec({ source, localPath, dependency });
    packageJson.devDependencies[cliPackageName] ??= cliDependency(source);
    packageJson.scripts["composer:check"] ??= "virtue-composer doctor . --strict";
    await writeFile(packageFile, `${JSON.stringify(packageJson, null, 2)}\n`);
    written.push("package.json dependencies");
  }
  const install = source === "local" ? "Run npm install --install-links." : "Run npm install.";
  return { ok: true, project: root, source, dependency: dependencySpec({ source, localPath, dependency }), cliDependency: cliDependency(source), structure, written, skipped, next: [`Import ${structure.foundationCss} from the app root.`, install, "Run npm run composer:check."] };
}

export async function upgrade(projectDirectory = ".", { source, localPath, dependency, components, all = false } = {}) {
  const root = path.resolve(projectDirectory);
  const configFile = path.join(root, "virtue-composer.config.json");
  if (!existsSync(configFile)) throw new Error("Virtue Composer is not initialized. Run virtue-composer init first.");
  const config = await readJson(configFile);
  const manifestFile = path.join(root, "virtue-composer.manifest.json");
  const manifest = existsSync(manifestFile) ? await readJson(manifestFile) : {};
  const requestedComponents = resolveComponents(components, { allByDefault: false });
  const fullInstallation = all || manifest.installationMode !== "selected";
  const targetIds = new Set(fullInstallation ? componentRegistry.map((component) => component.id) : [...(manifest.components ?? []), ...requestedComponents.map((component) => component.id)]);
  const targetComponents = componentRegistry.filter((component) => targetIds.has(component.id));
  const wrapperRoot = path.join(root, config.wrapperRoot ?? "src/components/composer");
  const foundationFile = path.join(root, config.foundationCss ?? "src/styles/composer.css");
  const written = [];
  const skipped = [];
  if (!config.compositionRoot) {
    const prefix = (config.sourceRoot ?? "src") === "." ? "" : `${config.sourceRoot ?? "src"}/`;
    config.compositionRoot = `${prefix}components/compositions`;
    await writeFile(configFile, `${JSON.stringify(config, null, 2)}\n`);
    written.push("virtue-composer.config.json composition root");
  }
  await mkdir(wrapperRoot, { recursive: true });
  let migratedWrapperImports = false;

  for (const component of targetComponents) {
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
  const targetNames = new Set(targetComponents.map(componentName));
  const missingExports = sourceIndex.split("\n").filter((line) => {
    const name = line.match(/from "\.\/(.*)"/)?.[1];
    return name && targetNames.has(name) && !targetIndexSource.includes(`./${name}`);
  });
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

  const templateManifest = await readJson(path.join(templateRoot, "virtue-composer.manifest.json"));
  const nextManifest = { ...manifest, contractVersion, composerVersion: templateManifest.composerVersion, cliVersion, installationMode: fullInstallation ? "full" : "selected", template: manifest.template ?? "next-jsx", components: targetComponents.map((component) => component.id) };
  await writeFile(manifestFile, `${JSON.stringify(nextManifest, null, 2)}\n`);
  written.push("virtue-composer.manifest.json");

  const packageFile = path.join(root, "package.json");
  if (existsSync(packageFile)) {
    const packageJson = await readJson(packageFile);
    packageJson.dependencies ??= {};
    packageJson.devDependencies ??= {};
    packageJson.scripts ??= {};
    const currentDependency = packageJson.dependencies[composerPackageName] ?? packageJson.dependencies[legacyComposerPackageName];
    const resolvedSource = source ?? config.packageSource ?? (currentDependency?.startsWith("file:") ? "local" : "npm");
    const nextDependency = dependency ?? (resolvedSource === "local" && currentDependency?.startsWith("file:") ? currentDependency : dependencySpec({ source: resolvedSource, localPath }));
    delete packageJson.dependencies[legacyComposerPackageName];
    packageJson.dependencies[composerPackageName] = nextDependency;
    packageJson.devDependencies[cliPackageName] = cliDependency(resolvedSource);
    packageJson.scripts["composer:check"] ??= "virtue-composer doctor . --strict";
    await writeFile(packageFile, `${JSON.stringify(packageJson, null, 2)}\n`);
    await writePackageSourceConfig(root, resolvedSource);
    written.push("package.json dependencies");
  }
  const aliasConfig = await ensureImportAlias(root, config.importAlias ?? "@/components/composer", config.wrapperRoot ?? "src/components/composer");
  written.push(`${aliasConfig} Composer alias`);
  return { ok: true, project: root, written, skipped, next: ["Run npm install.", "Run npm run composer:check.", "Run the project lint, typecheck, tests, and build."] };
}

export async function add(projectDirectory = ".", components) {
  const selected = resolveComponents(components, { allByDefault: false });
  if (selected.length === 0) throw new Error("Pass one or more components with --components=Button,Section.");
  return upgrade(projectDirectory, { components: selected.map((component) => component.id) });
}

function resolveCompositions(value) {
  if (!value) return [];
  const requested = Array.isArray(value) ? value : value.split(",").map((item) => item.trim()).filter(Boolean);
  const resolved = [];
  for (const query of requested) {
    const normalized = query.toLowerCase();
    const composition = compositionRegistry.find((record) => [record.id, record.title, record.template.component].some((candidate) => candidate.toLowerCase() === normalized));
    if (!composition) throw new Error(`Unknown Composer composition "${query}". Run virtue-composer compositions --compact to list available compositions.`);
    if (!resolved.some((record) => record.id === composition.id)) resolved.push(composition);
  }
  return resolved;
}

function resolveBlueprint(value) {
  if (!value) return null;
  const normalized = value.toLowerCase();
  const blueprint = blueprintRegistry.find((record) => [record.id, record.title].some((candidate) => candidate.toLowerCase() === normalized));
  if (!blueprint) throw new Error(`Unknown Composer blueprint "${value}". Run virtue-composer compositions --compact to list available blueprints.`);
  return blueprint;
}

export async function compose(projectDirectory = ".", { compositions, blueprint, pack, force = false } = {}) {
  const root = path.resolve(projectDirectory);
  const configFile = path.join(root, "virtue-composer.config.json");
  if (!existsSync(configFile)) throw new Error("Virtue Composer is not initialized. Run virtue-composer init first.");
  let config = await readJson(configFile);
  const selectedBlueprint = resolveBlueprint(blueprint);
  const requested = resolveCompositions(compositions);
  const normalizedPack = pack?.toLowerCase();
  const packCompositions = normalizedPack ? compositionRegistry.filter((record) => (record.pack ?? "core") === normalizedPack) : [];
  if (normalizedPack && packCompositions.length === 0) throw new Error(`Unknown Composer composition pack "${pack}". Run virtue-composer compositions --compact to list available packs.`);
  const blueprintCompositions = selectedBlueprint ? selectedBlueprint.sequence.map((id) => compositionRegistry.find((record) => record.id === id)) : [];
  const selected = [...requested, ...packCompositions, ...blueprintCompositions].filter(Boolean).filter((record, index, records) => records.findIndex((candidate) => candidate.id === record.id) === index);
  if (selected.length === 0) throw new Error("Pass --compositions=id[,id], --pack=id, or --blueprint=id.");

  const manifestFile = path.join(root, "virtue-composer.manifest.json");
  let manifest = existsSync(manifestFile) ? await readJson(manifestFile) : {};
  const requiredComponentIds = new Set(selected.flatMap((composition) => composition.components));
  const installedComponentIds = new Set(manifest.components ?? []);
  const missingComponentIds = [...requiredComponentIds].filter((id) => !installedComponentIds.has(id));
  const written = [];
  const skipped = [];
  if (missingComponentIds.length > 0) {
    const upgraded = await upgrade(root, { components: missingComponentIds });
    written.push(...upgraded.written);
    skipped.push(...upgraded.skipped);
    config = await readJson(configFile);
    manifest = await readJson(manifestFile);
  }

  const sourceRoot = config.sourceRoot ?? "src";
  const prefix = sourceRoot === "." ? "" : `${sourceRoot}/`;
  const compositionRoot = projectPath(config.compositionRoot ?? `${prefix}components/compositions`, "compositionRoot");
  const destination = path.join(root, compositionRoot);
  await mkdir(destination, { recursive: true });
  const templateCompositionRoot = path.join(templateRoot, "compositions");
  const importAlias = config.importAlias ?? "@/components/composer";
  const indexFile = path.join(destination, "index.js");
  let indexSource = existsSync(indexFile) ? await readFile(indexFile, "utf8") : "";

  for (const composition of selected) {
    const filename = path.basename(composition.template.source);
    const target = path.join(destination, filename);
    if (existsSync(target) && !force) skipped.push(`${composition.title} composition`);
    else {
      const source = (await readFile(path.join(templateCompositionRoot, filename), "utf8")).replaceAll("@/components/composer", importAlias);
      await writeFile(target, source);
      written.push(`${composition.title} composition`);
    }
    const exportLine = `export { default as ${composition.template.component} } from "./${composition.template.component}";`;
    if (!indexSource.includes(exportLine)) indexSource = `${indexSource.trimEnd()}${indexSource.trim() ? "\n" : ""}${exportLine}\n`;
  }
  await writeFile(indexFile, indexSource);
  written.push(`${compositionRoot}/index.js`);

  const styleTarget = path.join(destination, "compositions.module.css");
  if (existsSync(styleTarget) && !force) skipped.push("composition project styles");
  else {
    await cp(path.join(templateCompositionRoot, "compositions.module.css"), styleTarget, { force: true });
    written.push("composition project styles");
  }

  const installedCompositions = new Set(manifest.compositions ?? []);
  for (const composition of selected) installedCompositions.add(composition.id);
  const installedBlueprints = new Set(manifest.blueprints ?? []);
  if (selectedBlueprint) installedBlueprints.add(selectedBlueprint.id);
  manifest = { ...manifest, compositions: [...installedCompositions], blueprints: [...installedBlueprints] };
  await writeFile(manifestFile, `${JSON.stringify(manifest, null, 2)}\n`);
  written.push("virtue-composer.manifest.json");
  return {
    ok: true,
    project: root,
    compositionRoot,
    compositions: selected.map((composition) => composition.id),
    pack: normalizedPack ?? null,
    blueprint: selectedBlueprint?.id ?? null,
    written,
    skipped,
    next: ["Adapt the copied JSX and CSS to the project content and visual system.", "Run npm run composer:check.", "Run responsive and accessibility browser checks."],
  };
}

export async function inspectCompositions(projectDirectory = ".", { composition, family, pack, query, blueprint, compact = false } = {}) {
  const root = path.resolve(projectDirectory);
  const configFile = path.join(root, "virtue-composer.config.json");
  const manifestFile = path.join(root, "virtue-composer.manifest.json");
  const config = existsSync(configFile) ? await readJson(configFile) : null;
  const manifest = existsSync(manifestFile) ? await readJson(manifestFile) : null;
  const normalizedComposition = composition?.toLowerCase();
  const normalizedQuery = query?.trim().toLowerCase();
  const records = compositionRegistry.filter((record) => {
    const resolvedPack = record.pack ?? "core";
    const searchText = [record.id, record.title, record.family, resolvedPack, record.description, record.selection.description, ...record.selection.queries, ...record.selection.keywords].join(" ").toLowerCase();
    return (!normalizedComposition || [record.id, record.title, record.template.component].some((value) => value.toLowerCase() === normalizedComposition))
      && (!family || record.family === family.toLowerCase())
      && (!pack || resolvedPack === pack.toLowerCase())
      && (!normalizedQuery || searchText.includes(normalizedQuery));
  }).map((record) => {
    const status = { installed: Boolean(manifest?.compositions?.includes(record.id)) };
    return compact
      ? { id: record.id, title: record.title, family: record.family, pack: record.pack ?? "core", stability: record.stability, description: record.selection.description, addCommand: `virtue-composer compose . --compositions=${record.id}`, status }
      : { ...record, pack: record.pack ?? "core", addCommand: `virtue-composer compose . --compositions=${record.id}`, status };
  });
  const normalizedBlueprint = blueprint?.toLowerCase();
  const blueprintRecords = blueprintRegistry.filter((record) => {
    const searchText = [record.id, record.title, record.description, record.selection.description, ...record.selection.queries, ...record.selection.keywords].join(" ").toLowerCase();
    return (!normalizedBlueprint || [record.id, record.title].some((value) => value.toLowerCase() === normalizedBlueprint))
      && (!normalizedQuery || searchText.includes(normalizedQuery));
  }).map((record) => compact
    ? { id: record.id, title: record.title, description: record.selection.description, compositionCount: record.sequence.length, addCommand: `virtue-composer compose . --blueprint=${record.id}`, status: { installed: Boolean(manifest?.blueprints?.includes(record.id)) } }
    : { ...record, addCommand: `virtue-composer compose . --blueprint=${record.id}`, status: { installed: Boolean(manifest?.blueprints?.includes(record.id)) } });
  return {
    project: root,
    composerProject: existsSync(configFile),
    contractVersion,
    filters: { composition: composition ?? null, family: family ?? null, pack: pack ?? null, query: query ?? null, blueprint: blueprint ?? null, compact },
    summary: { availableCompositions: compositionRegistry.length, availableBlueprints: blueprintRegistry.length, installedCompositions: manifest?.compositions?.length ?? 0, installedBlueprints: manifest?.blueprints?.length ?? 0, returnedCompositions: records.length, returnedBlueprints: blueprintRecords.length },
    compositions: records,
    blueprints: blueprintRecords,
  };
}

function wrapperExists(wrapperDirectory, component) {
  const name = componentName(component);
  return [".js", ".jsx", ".ts", ".tsx"].some((extension) => existsSync(path.join(wrapperDirectory, `${name}${extension}`)));
}

async function inspectUsage(root, config) {
  const sourceRoot = path.join(root, config?.sourceRoot ?? "src");
  const wrapperRoot = config?.wrapperRoot ?? "src/components/composer";
  const normalizedWrapper = wrapperRoot.split(path.sep).join("/");
  const names = new Set();
  const candidates = [];
  const files = [];
  let scannedFiles = 0;
  let parsedFiles = 0;
  for (const file of await collectSourceFiles(sourceRoot)) {
    const relative = path.relative(root, file).split(path.sep).join("/");
    const isWrapper = relative === normalizedWrapper || relative.startsWith(`${normalizedWrapper}/`);
    if (isWrapper) continue;
    scannedFiles += 1;
    const analysis = await analyzeSource({ source: await readFile(file, "utf8"), absoluteFile: file, relativeFile: relative, isWrapper: false, importAlias: config?.importAlias ?? "@/components/composer", selectionHints, trustBoundaryHints });
    if (analysis.parsed) parsedFiles += 1;
    for (const name of analysis.usedNames) names.add(name);
    candidates.push(...analysis.candidates);
    files.push({ file: relative, components: [...analysis.usedNames].sort(), candidates: analysis.candidates });
  }
  return { names, candidates, files, scannedFiles, parsedFiles };
}

export async function inspect(projectDirectory = ".", { component, category, used = false, compact = false, candidates = false, files = false } = {}) {
  const root = path.resolve(projectDirectory);
  const configFile = path.join(root, "virtue-composer.config.json");
  const manifestFile = path.join(root, "virtue-composer.manifest.json");
  const config = existsSync(configFile) ? await readJson(configFile) : null;
  const manifest = existsSync(manifestFile) ? await readJson(manifestFile) : null;
  const usage = await inspectUsage(root, config);
  const wrapperDirectory = path.join(root, config?.wrapperRoot ?? "src/components/composer");
  const query = component?.toLowerCase();
  let records = componentRegistry.filter((record) => {
    const matchesComponent = !query || [record.id, record.title, componentName(record)].some((value) => value.toLowerCase() === query);
    const matchesCategory = !category || record.layer.toLowerCase() === category.toLowerCase();
    const matchesUsage = !used || usage.names.has(componentName(record));
    return matchesComponent && matchesCategory && matchesUsage;
  }).map((record) => {
    const status = { available: true, installed: Boolean(manifest?.components?.includes(record.id)), wrapped: wrapperExists(wrapperDirectory, record), used: usage.names.has(componentName(record)) };
    return compact
      ? {
          id: record.id,
          title: record.title,
          layer: record.layer,
          stability: record.stability,
          since: record.since,
          projectImport: record.projectImport,
          decisionGrade: Boolean(record.guidance.decision),
          runtime: record.runtime ? {
            clientRequired: record.runtime.clientRequired,
            measuredModuleBytes: record.runtime.measuredModuleBytes,
            complexity: record.runtime.complexity,
            lazyLoad: record.runtime.lazyLoad
          } : null,
          security: record.security ? {
            dataSensitivity: record.security.dataSensitivity,
            acceptsHtml: record.security.acceptsHtml,
            warnings: record.security.warnings
          } : null,
          status
        }
      : { ...record, status };
  });

  const allStatuses = componentRegistry.map((record) => ({ record, wrapped: wrapperExists(wrapperDirectory, record), used: usage.names.has(componentName(record)) }));
  const candidateRecords = candidates ? usage.candidates.map((candidate) => {
    const record = componentRegistry.find((componentRecord) => componentRecord.id === candidate.recommendation.id);
    const status = record ? { installed: Boolean(manifest?.components?.includes(record.id)), wrapped: wrapperExists(wrapperDirectory, record) } : { installed: false, wrapped: false };
    return { ...candidate, recommendation: { ...candidate.recommendation, status, addCommand: status.wrapped ? null : `virtue-composer add . --components=${candidate.recommendation.title.replaceAll(" ", "")}` } };
  }) : [];
  return {
    project: root,
    composerProject: existsSync(configFile),
    config,
    contractVersion,
    runtimeMethodology,
    filters: { component: component ?? null, category: category ?? null, used, compact, candidates, files },
    summary: {
      available: componentRegistry.length,
      installed: manifest?.components?.length ?? 0,
      wrapped: allStatuses.filter((item) => item.wrapped).length,
      used: allStatuses.filter((item) => item.used).length,
      scannedFiles: usage.scannedFiles,
      parsedFiles: usage.parsedFiles,
      candidates: candidateRecords.length,
      returned: records.length,
    },
    components: records,
    files: files ? usage.files : [],
    candidates: candidateRecords,
  };
}

function evidenceCovers(source, componentId) {
  return source.coverage.type === "all-registry-components" || source.coverage.componentIds.includes(componentId);
}

function manualEvidenceStatus(sources, key) {
  const checks = sources.map((source) => source.manualAccessibility[key]);
  if (checks.some((check) => check.status === "failed")) return { status: "failed", notes: checks.filter((check) => check.status === "failed").map((check) => check.notes) };
  if (checks.some((check) => check.status === "passed")) return { status: "passed", notes: checks.filter((check) => check.status === "passed").map((check) => check.notes) };
  return { status: "not-recorded", notes: [...new Set(checks.map((check) => check.notes))] };
}

export function stabilityReport(projectDirectory = ".", { component } = {}) {
  const root = path.resolve(projectDirectory);
  const query = component?.toLowerCase();
  const matchingComponents = componentRegistry.filter((record) => !query || [record.id, record.title, componentName(record)].some((value) => value.toLowerCase() === query));
  if (component && matchingComponents.length === 0) throw new Error(`Unknown Composer component "${component}". Run virtue-composer inspect --compact to list available components.`);
  const policy = componentStabilityEvidence.promotionPolicy;
  const records = matchingComponents.map((record) => {
    const sources = componentStabilityEvidence.sources.filter((source) => evidenceCovers(source, record.id));
    const productionSources = sources.filter((source) => source.kind === "production-adoption");
    const productUseCases = [...new Set(productionSources.flatMap((source) => source.useCases))].sort();
    const useCases = [...new Set(productionSources.flatMap((source) => source.componentUseCases?.[record.id] ?? []))].sort();
    const productTypes = [...new Set(productionSources.map((source) => source.productType))].sort();
    const browserFamilies = [...new Set(sources.flatMap((source) => source.browserFamilies))].sort();
    const automatedAccessibility = [...new Set(sources.flatMap((source) => source.automatedAccessibility))].sort();
    const manualAccessibility = Object.fromEntries(["screenReader", "physicalTouch", "windowsHighContrast"].map((key) => [key, manualEvidenceStatus(sources, key)]));
    const defects = sources.flatMap((source) => source.defects.filter((defect) => defect.componentIds.includes(record.id)).map((defect) => ({ ...defect, sourceId: source.id })));
    const breakingRevisions = sources.flatMap((source) => source.breakingRevisions.filter((revision) => revision.componentIds.includes(record.id)).map((revision) => ({ ...revision, sourceId: source.id })));
    const unresolvedRisks = [...new Set(sources.flatMap((source) => source.unresolvedRisks))].sort();
    const review = componentStabilityEvidence.reviews.find((candidate) => candidate.componentId === record.id) ?? null;
    const thresholds = {
      productionProjects: { actual: productionSources.length, required: policy.minimumProductionProjects, met: productionSources.length >= policy.minimumProductionProjects },
      useCaseFamilies: { actual: useCases.length, required: policy.minimumUseCaseFamilies, met: useCases.length >= policy.minimumUseCaseFamilies },
      browserFamilies: { actual: browserFamilies.length, required: policy.minimumBrowserFamilies, met: browserFamilies.length >= policy.minimumBrowserFamilies },
      automatedAccessibility: { actual: automatedAccessibility.length, required: 1, met: automatedAccessibility.length > 0 },
      manualAccessibility: Object.fromEntries(policy.requiredManualEvidence.map((key) => [key, { actual: manualAccessibility[key].status, required: "passed", met: manualAccessibility[key].status === "passed" }]))
    };
    const evidenceThresholdsMet = [
      thresholds.productionProjects.met,
      thresholds.useCaseFamilies.met,
      thresholds.browserFamilies.met,
      thresholds.automatedAccessibility.met,
      ...Object.values(thresholds.manualAccessibility).map((threshold) => threshold.met)
    ].every(Boolean);
    const promotionGatePassed = evidenceThresholdsMet && review?.reviewerDecision === "approved";
    return {
      id: record.id,
      title: record.title,
      stability: record.stability,
      evidence: {
        sourceIds: sources.map((source) => source.id),
        productionProjects: productionSources.length,
        productTypes,
        productUseCases,
        useCases,
        browserFamilies,
        automatedAccessibility,
        manualAccessibility,
        defects,
        breakingRevisions,
        unresolvedRisks
      },
      promotion: {
        automaticPromotion: false,
        evidenceThresholdsMet,
        humanReviewRequired: policy.humanReviewRequired,
        promotionGatePassed,
        thresholds,
        review
      }
    };
  });
  return {
    project: root,
    schemaVersion: componentStabilityEvidence.schemaVersion,
    policy,
    summary: {
      components: records.length,
      productionSources: componentStabilityEvidence.sources.filter((source) => source.kind === "production-adoption").length,
      fixtureSources: componentStabilityEvidence.sources.filter((source) => source.kind === "maintained-fixture").length,
      withProductionEvidence: records.filter((record) => record.evidence.productionProjects > 0).length,
      evidenceThresholdsMet: records.filter((record) => record.promotion.evidenceThresholdsMet).length,
      approvedPromotionGates: records.filter((record) => record.promotion.promotionGatePassed).length,
      pendingHumanReviews: records.filter((record) => record.promotion.review?.reviewerDecision === "pending").length
    },
    components: records
  };
}

function printHuman(command, result) {
  if (command === "doctor") {
    console.log(`Virtue Composer Doctor${result.strict ? " (strict)" : ""}: ${result.ok ? "PASS" : "FAIL"}`);
    console.log(`${result.scannedFiles} files | ${result.summary.errors} errors | ${result.summary.warnings} warnings`);
    console.log(`Coverage: ${result.coverage.parsedFiles}/${result.scannedFiles} source files parsed | ${result.coverage.layoutDetection}`);
    for (const item of result.findings) console.log(`${item.severity.toUpperCase()} ${item.rule} ${item.file}:${item.line} ${item.message}`);
    return;
  }
  if (command === "inspect" || command === "report") {
    console.log(`Virtue Composer ${result.composerProject ? "detected" : "not detected"} at ${result.project}`);
    console.log(`${result.summary.available} available | ${result.summary.installed} installed | ${result.summary.wrapped} wrapped | ${result.summary.used} used | ${result.summary.returned} returned | contract v${result.contractVersion}`);
    for (const component of result.components) {
      const runtime = component.runtime ? ` | ${component.runtime.measuredModuleBytes}B own-module, ${component.runtime.complexity}${component.runtime.clientRequired ? ", client" : ""}` : "";
      const trust = component.security ? ` | trust:${component.security.dataSensitivity}${component.security.acceptsHtml ? ", HTML" : ""}` : "";
      console.log(`${component.id.padEnd(22)} ${(component.stability ?? "unknown").padEnd(12)} ${component.status.used ? "used" : component.status.wrapped ? "wrapped" : "available"}  ${component.projectImport}${runtime}${trust}`);
    }
    for (const candidate of result.candidates) {
      const install = candidate.recommendation.addCommand ? ` Next: ${candidate.recommendation.addCommand}.` : "";
      console.log(`${candidate.confidence.toUpperCase()} ${candidate.rule} ${candidate.file}:${candidate.line} ${candidate.message} Recommended: ${candidate.recommendation.title} (${candidate.recommendation.stability}).${install}`);
    }
    return;
  }
  if (command === "compositions") {
    console.log(`Virtue Composer ${result.composerProject ? "detected" : "not detected"} at ${result.project}`);
    console.log(`${result.summary.availableCompositions} compositions | ${result.summary.availableBlueprints} blueprints | ${result.summary.returnedCompositions} compositions returned | ${result.summary.returnedBlueprints} blueprints returned`);
    for (const composition of result.compositions) console.log(`${composition.id.padEnd(32)} ${(composition.pack ?? "core").padEnd(18)} ${composition.family.padEnd(14)} ${composition.status.installed ? "installed" : "available"}  ${composition.addCommand}`);
    for (const blueprint of result.blueprints) console.log(`${blueprint.id.padEnd(32)} blueprint      ${blueprint.status.installed ? "installed" : "available"}  ${blueprint.addCommand}`);
    return;
  }
  if (command === "stability") {
    console.log(`Virtue Composer stability evidence at ${result.project}`);
    console.log(`${result.summary.components} components | ${result.summary.productionSources} production sources | ${result.summary.fixtureSources} fixture sources | ${result.summary.evidenceThresholdsMet} evidence thresholds met | ${result.summary.approvedPromotionGates} approved promotion gates`);
    console.log("Counts never promote a component automatically; every promotion gate requires an approved human review.");
    for (const component of result.components) {
      const manual = Object.values(component.evidence.manualAccessibility).every((check) => check.status === "passed") ? "manual-pass" : "manual-incomplete";
      const review = component.promotion.review ? `${component.promotion.review.recommendation}/${component.promotion.review.reviewerDecision}` : "unreviewed";
      console.log(`${component.id.padEnd(28)} ${component.stability.padEnd(12)} ${String(component.evidence.productionProjects).padStart(2)} production  ${manual.padEnd(17)} ${review}`);
    }
    return;
  }
  console.log(`Virtue Composer ${command === "init" ? "initialized" : "updated"} at ${result.project}`);
  if (result.written.length) console.log(`Written: ${result.written.join(", ")}`);
  if (result.skipped.length) console.log(`Skipped: ${result.skipped.join(", ")}`);
  for (const step of result.next) console.log(`Next: ${step}`);
}

export async function run(argv) {
  const command = argv[0] ?? "help";
  const valueOptions = new Set(["--component", "--components", "--composition", "--compositions", "--blueprint", "--pack", "--family", "--query", "--category", "--source-root", "--wrapper-root", "--composition-root", "--foundation-css", "--import-alias", "--language"]);
  const option = (name) => {
    const inline = argv.find((arg) => arg.startsWith(`${name}=`));
    if (inline) return inline.slice(name.length + 1);
    const index = argv.indexOf(name);
    return index >= 0 ? argv[index + 1] : undefined;
  };
  let directory = ".";
  for (let index = 1; index < argv.length; index += 1) {
    const argument = argv[index];
    if (valueOptions.has(argument)) { index += 1; continue; }
    if (!argument.startsWith("-")) { directory = argument; break; }
  }
  const json = argv.includes("--json");
  const force = argv.includes("--force");
  const localOption = argv.find((arg) => arg === "--local" || arg.startsWith("--local="));
  const localPath = localOption?.includes("=") ? localOption.slice(localOption.indexOf("=") + 1) : undefined;
  const source = localOption ? "local" : argv.includes("--npm") ? "npm" : undefined;
  if (!["init", "add", "upgrade", "inspect", "report", "doctor", "compositions", "compose", "stability"].includes(command)) {
    console.log("Usage: virtue-composer <init|add|upgrade|inspect|report|doctor|compositions|compose|stability> [project] [--npm|--local[=/path]] [--components=Button,Section] [--compositions=id,id] [--blueprint=id] [--pack=id] [--composition=value] [--family=value] [--query=value] [--all] [--component=value] [--category=value] [--used] [--compact] [--candidates] [--strict] [--source-root=path] [--wrapper-root=path] [--composition-root=path] [--foundation-css=path] [--import-alias=alias] [--json] [--force]");
    return;
  }
  const inspectOptions = { component: option("--component"), category: option("--category"), used: argv.includes("--used") || command === "report", compact: argv.includes("--compact") || command === "report", candidates: argv.includes("--candidates"), files: command === "report" };
  const initOptions = { force, source: source ?? "npm", localPath, sourceRoot: option("--source-root"), wrapperRoot: option("--wrapper-root"), compositionRoot: option("--composition-root"), foundationCss: option("--foundation-css"), importAlias: option("--import-alias"), language: option("--language"), components: option("--components") };
  const result = command === "init"
    ? await init(directory, initOptions)
    : command === "add"
      ? await add(directory, option("--components"))
      : command === "upgrade"
        ? await upgrade(directory, { source, localPath, components: option("--components"), all: argv.includes("--all") })
        : command === "inspect" || command === "report"
          ? await inspect(directory, inspectOptions)
          : command === "stability"
            ? stabilityReport(directory, { component: option("--component") })
            : command === "compositions"
              ? await inspectCompositions(directory, { composition: option("--composition"), family: option("--family"), pack: option("--pack"), query: option("--query"), blueprint: option("--blueprint"), compact: argv.includes("--compact") })
              : command === "compose"
                ? await compose(directory, { compositions: option("--compositions"), blueprint: option("--blueprint"), pack: option("--pack"), force })
                : await doctor(directory, { strict: argv.includes("--strict") });
  if (json) console.log(JSON.stringify(result, null, 2));
  else printHuman(command, result);
  if (command === "doctor" && !result.ok) process.exitCode = 1;
}
