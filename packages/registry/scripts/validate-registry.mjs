import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const registryUrls = [new URL("../components.json", import.meta.url), new URL("../components.phase-3.json", import.meta.url), new URL("../components.phase-4.json", import.meta.url)];
const registry = (await Promise.all(registryUrls.map(async (url) => JSON.parse(await readFile(url, "utf8"))))).flat();
const required = [
  "id",
  "title",
  "layer",
  "packageImport",
  "projectImport",
  "client",
  "props",
  "states",
  "accessibilityChecks",
  "replaces",
  "showcaseFixtures",
  "doctorRules",
  "contractVersion",
];
const ids = new Set();
const errors = [];

if (!Array.isArray(registry) || registry.length === 0) {
  errors.push("Registry must be a non-empty array.");
}

for (const [index, component] of registry.entries()) {
  const label = component?.id ?? `entry ${index}`;
  for (const key of required) {
    if (!(key in component)) errors.push(`${label}: missing ${key}`);
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(component.id ?? "")) errors.push(`${label}: invalid id`);
  if (ids.has(component.id)) errors.push(`${label}: duplicate id`);
  ids.add(component.id);
  if (component.contractVersion !== 1) errors.push(`${label}: contractVersion must be 1`);
  for (const key of ["props", "states", "accessibilityChecks", "replaces", "showcaseFixtures", "doctorRules"]) {
    if (!Array.isArray(component[key])) errors.push(`${label}: ${key} must be an array`);
  }
}

if (errors.length > 0) {
  console.error(`Registry validation failed (${errors.length})`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`Registry valid: ${registry.length} components (${registryUrls.map(fileURLToPath).join(", ")})`);
