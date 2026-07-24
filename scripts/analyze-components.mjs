import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { componentRegistry } from "../packages/registry/src/index.js";

const workspaceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceRoot = path.join(workspaceRoot, "packages/composer/src");
const distRoot = path.join(workspaceRoot, "packages/composer/dist");
const packageJson = JSON.parse(await readFile(path.join(workspaceRoot, "packages/composer/package.json"), "utf8"));
const baseline = { components: 128, clientBoundaries: 81, compiledBytes: 253890, rootSlots: 124, runtimeDependencies: 36 };
const budgets = { largestComponentBytes: 12000, rootIndexBytes: 12000 };

const sourceFiles = (await readdir(sourceRoot)).filter((file) => file.endsWith(".tsx"));
const sources = await Promise.all(sourceFiles.map(async (file) => [file, await readFile(path.join(sourceRoot, file), "utf8")]));
const distFiles = (await readdir(distRoot)).filter((file) => file.endsWith(".js"));
const compiledFiles = await Promise.all(distFiles.map(async (file) => [file, (await readFile(path.join(distRoot, file))).byteLength]));
const compiledBytes = compiledFiles.reduce((total, [, bytes]) => total + bytes, 0);
const componentFiles = compiledFiles.filter(([file]) => file !== "index.js").sort((a, b) => b[1] - a[1]);
const largestComponent = componentFiles[0];
const rootIndexBytes = compiledFiles.find(([file]) => file === "index.js")?.[1] ?? 0;
const dataAttributes = new Set(sources.flatMap(([, source]) => source.match(/data-vc-[a-z0-9-]+/g) ?? []));
const sourceByName = new Map(sources.map(([file, source]) => [path.basename(file, ".tsx"), source]));
const bytesByName = new Map(compiledFiles.map(([file, bytes]) => [path.basename(file, ".js"), bytes]));
const runtimeProfiles = componentRegistry.filter((component) => component.runtime).map((component) => {
  const name = component.projectImport.split("/").at(-1);
  const actualBytes = bytesByName.get(name);
  const source = sourceByName.get(name) ?? "";
  const actualEffectCount = (source.match(/\buse(?:Layout)?Effect\s*\(/g) ?? []).length;
  const baselineBytes = component.runtime.measuredModuleBytes;
  const deltaPercent = baselineBytes === 0 ? 0 : ((actualBytes - baselineBytes) / baselineBytes) * 100;
  return { component, name, actualBytes, actualEffectCount, baselineBytes, deltaPercent };
});

const metrics = {
  components: sourceFiles.length,
  clientBoundaries: sources.filter(([, source]) => /^"use client";/m.test(source)).length,
  effectFiles: sources.filter(([, source]) => /\buse(?:Layout)?Effect\b/.test(source)).length,
  runtimeDependencies: Object.keys(packageJson.dependencies ?? {}).length,
  exportSubpaths: Object.keys(packageJson.exports ?? {}).length,
  dataAttributes: dataAttributes.size,
  rootSlots: sources.filter(([, source]) => /data-vc-component=/.test(source) && /data-vc-slot="root"/.test(source)).length,
  compiledBytes,
  largestComponent,
  rootIndexBytes,
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
console.log(`  Largest component: ${metrics.largestComponent[0]} at ${metrics.largestComponent[1]} bytes (budget: ${budgets.largestComponentBytes})`);
console.log(`  Root index:        ${metrics.rootIndexBytes} bytes (budget: ${budgets.rootIndexBytes})`);
console.log(`  Largest five:      ${componentFiles.slice(0, 5).map(([file, bytes]) => `${file} ${bytes}`).join(", ")}`);
console.log(`  Runtime profiles:  ${runtimeProfiles.length} decision-grade components`);
for (const profile of runtimeProfiles) {
  console.log(`    ${profile.component.id.padEnd(24)} ${String(profile.actualBytes).padStart(5)} bytes | baseline ${String(profile.baselineBytes).padStart(5)} | ${profile.deltaPercent >= 0 ? "+" : ""}${profile.deltaPercent.toFixed(1)}% | ${profile.actualEffectCount} effects`);
}

if (process.argv.includes("--check")) {
  const failures = [];
  if (metrics.components < baseline.components) failures.push(`component count fell below ${baseline.components}`);
  if (metrics.clientBoundaries > baseline.clientBoundaries) failures.push(`client boundaries exceed ${baseline.clientBoundaries}`);
  if (metrics.runtimeDependencies > baseline.runtimeDependencies) failures.push(`runtime dependencies exceed ${baseline.runtimeDependencies}`);
  if (metrics.exportSubpaths !== metrics.components + 1) failures.push("package must expose exactly one subpath per component plus the root export");
  if (metrics.rootSlots < baseline.rootSlots) failures.push(`fewer than ${baseline.rootSlots} component roots expose data-vc-slot=\"root\"`);
  if (metrics.compiledBytes > baseline.compiledBytes * 1.1) failures.push("compiled JavaScript grew by more than 10%");
  if (metrics.largestComponent[1] > budgets.largestComponentBytes) failures.push(`${metrics.largestComponent[0]} exceeds the ${budgets.largestComponentBytes}-byte component budget`);
  if (metrics.rootIndexBytes > budgets.rootIndexBytes) failures.push(`root index exceeds the ${budgets.rootIndexBytes}-byte budget`);
  for (const profile of runtimeProfiles) {
    if (!Number.isInteger(profile.actualBytes)) failures.push(`${profile.component.id}: compiled module is missing`);
    else if (Math.abs(profile.deltaPercent) > 10) failures.push(`${profile.component.id}: compiled module changed ${profile.deltaPercent.toFixed(1)}% from the ${profile.baselineBytes}-byte registry measurement`);
    if (profile.actualEffectCount !== profile.component.runtime.effectCount) failures.push(`${profile.component.id}: registry effectCount ${profile.component.runtime.effectCount} does not match measured ${profile.actualEffectCount}`);
  }
  if (failures.length > 0) throw new Error(`Component analysis failed:\n- ${failures.join("\n- ")}`);
  console.log("Component analysis checks passed.");
}
