import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { componentRegistry } from "../packages/registry/src/index.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const packageJson = JSON.parse(await readFile(path.join(root, "packages/composer/package.json"), "utf8"));
const errors = [];

const triplets = [
  ["open", "defaultOpen", "onOpenChange"],
  ["value", "defaultValue", "onValueChange"],
  ["checked", "defaultChecked", "onCheckedChange"],
];

for (const component of componentRegistry) {
  const name = component.projectImport.split("/").at(-1);
  const sourceFile = path.join(root, "packages/composer/src", `${name}.tsx`);
  try {
    await access(sourceFile);
  } catch {
    errors.push(`${component.id}: missing source file packages/composer/src/${name}.tsx`);
  }

  const subpath = component.packageImport.replace("@virtuecreation/composer", ".");
  if (!packageJson.exports?.[subpath]) errors.push(`${component.id}: missing package export ${subpath}`);

  for (const [value, defaultValue, change] of triplets) {
    const props = new Set(component.props);
    if (props.has(change) && (!props.has(value) || !props.has(defaultValue))) {
      errors.push(`${component.id}: ${change} requires ${value} and ${defaultValue}`);
    }
    if ((props.has("open") || props.has("defaultOpen") || props.has("onOpenChange")) && value === "open" && !(props.has(value) && props.has(defaultValue) && props.has(change))) {
      errors.push(`${component.id}: open state must expose open/defaultOpen/onOpenChange`);
    }
  }

  if (component.stability === "deprecated" && !component.guidance.alternatives.length) {
    errors.push(`${component.id}: deprecated components must name an alternative`);
  }
}

const expectedExports = componentRegistry.length + 1;
if (Object.keys(packageJson.exports ?? {}).length !== expectedExports) {
  errors.push(`package exports: expected ${expectedExports}, received ${Object.keys(packageJson.exports ?? {}).length}`);
}

if (errors.length) {
  console.error(`Component contract convention check failed (${errors.length})`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

const stability = componentRegistry.reduce((groups, component) => {
  (groups[component.stability] ??= []).push(component);
  return groups;
}, {});
console.log(`Component contracts consistent: ${componentRegistry.length} components (${Object.entries(stability).map(([key, records]) => `${records.length} ${key}`).join(", ")}).`);
