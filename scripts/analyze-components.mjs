import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const workspaceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceRoot = path.join(workspaceRoot, "packages/composer/src");
const distRoot = path.join(workspaceRoot, "packages/composer/dist");
const packageJson = JSON.parse(await readFile(path.join(workspaceRoot, "packages/composer/package.json"), "utf8"));
const baseline = { components: 120, clientBoundaries: 80, compiledBytes: 180527, rootSlots: 0 };

const sourceFiles = (await readdir(sourceRoot)).filter((file) => file.endsWith(".tsx"));
const sources = await Promise.all(sourceFiles.map(async (file) => [file, await readFile(path.join(sourceRoot, file), "utf8")]));
const distFiles = (await readdir(distRoot)).filter((file) => file.endsWith(".js"));
const compiledBytes = (await Promise.all(distFiles.map((file) => readFile(path.join(distRoot, file))))).reduce((total, file) => total + file.byteLength, 0);
const dataAttributes = new Set(sources.flatMap(([, source]) => source.match(/data-vc-[a-z0-9-]+/g) ?? []));

const metrics = {
  components: sourceFiles.length,
  clientBoundaries: sources.filter(([, source]) => /^"use client";/m.test(source)).length,
  effectFiles: sources.filter(([, source]) => /\buse(?:Layout)?Effect\b/.test(source)).length,
  runtimeDependencies: Object.keys(packageJson.dependencies ?? {}).length,
  exportSubpaths: Object.keys(packageJson.exports ?? {}).length,
  dataAttributes: dataAttributes.size,
  rootSlots: sources.filter(([, source]) => /data-vc-component=/.test(source) && /data-vc-slot="root"/.test(source)).length,
  compiledBytes,
};

console.log("Virtue Composer component analysis");
console.log(`  Components:        ${metrics.components}`);
console.log(`  Client boundaries: ${metrics.clientBoundaries} (published baseline: ${baseline.clientBoundaries})`);
console.log(`  Effect files:      ${metrics.effectFiles}`);
console.log(`  Runtime deps:      ${metrics.runtimeDependencies}`);
console.log(`  Export subpaths:   ${metrics.exportSubpaths}`);
console.log(`  Data attributes:   ${metrics.dataAttributes}`);
console.log(`  Root slots:        ${metrics.rootSlots}`);
console.log(`  Compiled JS:       ${metrics.compiledBytes} bytes (published baseline: ${baseline.compiledBytes})`);

if (process.argv.includes("--check")) {
  const failures = [];
  if (metrics.components < baseline.components) failures.push(`component count fell below ${baseline.components}`);
  if (metrics.clientBoundaries > baseline.clientBoundaries) failures.push(`client boundaries exceed ${baseline.clientBoundaries}`);
  if (metrics.rootSlots < 116) failures.push("fewer than 116 component roots expose data-vc-slot=\"root\"");
  if (metrics.compiledBytes > baseline.compiledBytes * 1.1) failures.push("compiled JavaScript grew by more than 10%");
  if (failures.length > 0) throw new Error(`Component analysis failed:\n- ${failures.join("\n- ")}`);
  console.log("Component analysis checks passed.");
}
