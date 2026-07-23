import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const registryUrls = [new URL("../components.json", import.meta.url), new URL("../components.phase-3.json", import.meta.url), new URL("../components.phase-4.json", import.meta.url), new URL("../components.phase-5.json", import.meta.url)];
const registry = (await Promise.all(registryUrls.map(async (url) => JSON.parse(await readFile(url, "utf8"))))).flat();
const compositionUrl = new URL("../compositions.json", import.meta.url);
const compositionSchemaUrl = new URL("../composition.schema.json", import.meta.url);
const blueprintUrl = new URL("../blueprints.json", import.meta.url);
const compositions = JSON.parse(await readFile(compositionUrl, "utf8"));
const compositionSchema = JSON.parse(await readFile(compositionSchemaUrl, "utf8"));
const blueprints = JSON.parse(await readFile(blueprintUrl, "utf8"));
const registryRoot = path.dirname(fileURLToPath(compositionUrl));
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
  "stability",
  "since",
  "guidance",
  "contractVersion",
];
const ids = new Set();
const errors = [];
const validStabilities = new Set(["stable", "beta", "experimental", "deprecated"]);
const validLayers = new Set(["structure", "navigation", "action", "field", "choice", "disclosure", "data", "content", "media", "feedback", "loading", "overlay"]);
const validPropKinds = new Set(["boolean", "descriptor-array", "enum", "function", "number", "react-node", "record", "string"]);
const allowedKeys = new Set([...required, "propContracts", "selectionHints"]);
const allowedGuidanceKeys = new Set(["use", "avoid", "alternatives", "companions", "responsive"]);

if (!Array.isArray(registry) || registry.length === 0) {
  errors.push("Registry must be a non-empty array.");
}

for (const [index, component] of registry.entries()) {
  const label = component?.id ?? `entry ${index}`;
  for (const key of required) {
    if (!(key in component)) errors.push(`${label}: missing ${key}`);
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(component.id ?? "")) errors.push(`${label}: invalid id`);
  if (!validLayers.has(component.layer)) errors.push(`${label}: invalid layer`);
  for (const key of Object.keys(component)) if (!allowedKeys.has(key)) errors.push(`${label}: unknown property ${key}`);
  if (ids.has(component.id)) errors.push(`${label}: duplicate id`);
  ids.add(component.id);
  if (component.contractVersion !== 1) errors.push(`${label}: contractVersion must be 1`);
  if (!validStabilities.has(component.stability)) errors.push(`${label}: invalid stability`);
  if (!/^\d+\.\d+\.\d+$/.test(component.since ?? "")) errors.push(`${label}: since must be a semantic version`);
  for (const key of ["props", "states", "accessibilityChecks", "replaces", "showcaseFixtures", "doctorRules"]) {
    if (!Array.isArray(component[key])) errors.push(`${label}: ${key} must be an array`);
    else if (new Set(component[key]).size !== component[key].length) errors.push(`${label}: ${key} must not contain duplicates`);
  }
  if (component.propContracts) {
    for (const [prop, contract] of Object.entries(component.propContracts)) {
      if (!component.props.includes(prop)) errors.push(`${label}: propContracts.${prop} is not listed in props`);
      if (!contract || typeof contract !== "object" || !contract.kind || !contract.description) errors.push(`${label}: propContracts.${prop} must define kind and description`);
      else if (!validPropKinds.has(contract.kind)) errors.push(`${label}: propContracts.${prop} has invalid kind ${contract.kind}`);
    }
  }
  if (component.selectionHints) {
    if (!Array.isArray(component.selectionHints)) errors.push(`${label}: selectionHints must be an array`);
    else for (const [hintIndex, hint] of component.selectionHints.entries()) {
      const hintLabel = `${label}: selectionHints[${hintIndex}]`;
      if (!new Set(["jsx-prop-equals", "jsx-prop-divisor", "jsx-ancestor"]).has(hint.rule)) errors.push(`${hintLabel} has an invalid rule`);
      if (typeof hint.from !== "string" || hint.from.trim() === "") errors.push(`${hintLabel}.from must be a non-empty string`);
      if (!new Set(["high", "medium", "low"]).has(hint.confidence)) errors.push(`${hintLabel} has an invalid confidence`);
      if (typeof hint.message !== "string" || hint.message.trim() === "") errors.push(`${hintLabel}.message must be a non-empty string`);
      if (["jsx-prop-equals", "jsx-prop-divisor"].includes(hint.rule) && (typeof hint.prop !== "string" || !("value" in hint))) errors.push(`${hintLabel} must define prop and value`);
      if (hint.rule === "jsx-ancestor" && (typeof hint.ancestor !== "string" || hint.ancestor.trim() === "")) errors.push(`${hintLabel}.ancestor must be a non-empty string`);
      for (const key of Object.keys(hint)) if (!["rule", "from", "prop", "value", "ancestor", "confidence", "message"].includes(key)) errors.push(`${hintLabel} has unknown property ${key}`);
    }
  }
  if (!component.guidance || typeof component.guidance !== "object") {
    errors.push(`${label}: guidance must be an object`);
  } else {
    for (const key of Object.keys(component.guidance)) if (!allowedGuidanceKeys.has(key)) errors.push(`${label}: guidance has unknown property ${key}`);
    for (const key of ["use", "avoid", "responsive"]) {
      if (typeof component.guidance[key] !== "string" || component.guidance[key].trim() === "") errors.push(`${label}: guidance.${key} must be a non-empty string`);
    }
    for (const key of ["alternatives", "companions"]) {
      if (!Array.isArray(component.guidance[key])) errors.push(`${label}: guidance.${key} must be an array`);
      else if (new Set(component.guidance[key]).size !== component.guidance[key].length) errors.push(`${label}: guidance.${key} must not contain duplicates`);
    }
  }
}

for (const component of registry) {
  for (const key of ["alternatives", "companions"]) {
    for (const relatedId of component.guidance?.[key] ?? []) {
      if (!ids.has(relatedId)) errors.push(`${component.id}: guidance.${key} references unknown component ${relatedId}`);
      if (relatedId === component.id) errors.push(`${component.id}: guidance.${key} cannot reference itself`);
    }
  }
}

const compositionIds = new Set();
const validCompositionFamilies = new Set(compositionSchema.items.properties.family.enum);
const validCompositionPacks = new Set(compositionSchema.items.properties.pack.enum);
const validSlotKinds = new Set(compositionSchema.items.properties.anatomy.items.properties.kind.enum);
const requiredCompositionKeys = ["id", "title", "family", "description", "selection", "anatomy", "components", "client", "responsive", "accessibilityChecks", "neighbors", "template", "evidence", "stability", "since", "contractVersion"];
const allowedCompositionKeys = new Set([...requiredCompositionKeys, "pack"]);
const allowedSelectionKeys = new Set(["description", "queries", "avoidWhen", "keywords"]);
const allowedAnatomyKeys = new Set(["id", "label", "kind", "required"]);
const allowedResponsiveKeys = new Set(["compact", "wide"]);
const allowedNeighborKeys = new Set(["before", "after"]);
const allowedTemplateKeys = new Set(["component", "source", "style"]);

if (!Array.isArray(compositions) || compositions.length === 0) {
  errors.push("Composition registry must be a non-empty array.");
}

for (const [index, composition] of compositions.entries()) {
  const label = composition?.id ?? `composition entry ${index}`;
  for (const key of requiredCompositionKeys) if (!(key in composition)) errors.push(`${label}: missing ${key}`);
  for (const key of Object.keys(composition)) if (!allowedCompositionKeys.has(key)) errors.push(`${label}: unknown property ${key}`);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(composition.id ?? "")) errors.push(`${label}: invalid id`);
  if (compositionIds.has(composition.id)) errors.push(`${label}: duplicate composition id`);
  compositionIds.add(composition.id);
  if (!validCompositionFamilies.has(composition.family)) errors.push(`${label}: invalid family`);
  if (composition.pack !== undefined && !validCompositionPacks.has(composition.pack)) errors.push(`${label}: invalid pack`);
  if (!validStabilities.has(composition.stability)) errors.push(`${label}: invalid stability`);
  if (!/^\d+\.\d+\.\d+$/.test(composition.since ?? "")) errors.push(`${label}: since must be a semantic version`);
  if (composition.contractVersion !== 1) errors.push(`${label}: contractVersion must be 1`);
  if (typeof composition.client !== "boolean") errors.push(`${label}: client must be boolean`);
  if (!composition.selection || typeof composition.selection !== "object") {
    errors.push(`${label}: selection must be an object`);
  } else {
    for (const key of Object.keys(composition.selection)) if (!allowedSelectionKeys.has(key)) errors.push(`${label}: selection has unknown property ${key}`);
    if (typeof composition.selection.description !== "string" || composition.selection.description.trim() === "") errors.push(`${label}: selection.description must be non-empty`);
    for (const key of ["queries", "avoidWhen", "keywords"]) {
      if (!Array.isArray(composition.selection[key]) || composition.selection[key].length === 0) errors.push(`${label}: selection.${key} must be non-empty`);
      else if (new Set(composition.selection[key]).size !== composition.selection[key].length) errors.push(`${label}: selection.${key} must not contain duplicates`);
    }
  }
  if (!Array.isArray(composition.anatomy) || composition.anatomy.length < 2) {
    errors.push(`${label}: anatomy must contain at least two slots`);
  } else {
    const slotIds = new Set();
    for (const [slotIndex, slot] of composition.anatomy.entries()) {
      const slotLabel = `${label}: anatomy[${slotIndex}]`;
      for (const key of Object.keys(slot)) if (!allowedAnatomyKeys.has(key)) errors.push(`${slotLabel} has unknown property ${key}`);
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slot.id ?? "")) errors.push(`${slotLabel} has invalid id`);
      if (slotIds.has(slot.id)) errors.push(`${slotLabel} duplicates slot ${slot.id}`);
      slotIds.add(slot.id);
      if (!validSlotKinds.has(slot.kind)) errors.push(`${slotLabel} has invalid kind`);
      if (typeof slot.required !== "boolean") errors.push(`${slotLabel}.required must be boolean`);
    }
  }
  if (!Array.isArray(composition.components) || composition.components.length === 0) {
    errors.push(`${label}: components must be non-empty`);
  } else {
    if (new Set(composition.components).size !== composition.components.length) errors.push(`${label}: components must not contain duplicates`);
    for (const componentId of composition.components) if (!ids.has(componentId)) errors.push(`${label}: references unknown component ${componentId}`);
  }
  if (!composition.responsive || typeof composition.responsive !== "object") {
    errors.push(`${label}: responsive must be an object`);
  } else {
    for (const key of Object.keys(composition.responsive)) if (!allowedResponsiveKeys.has(key)) errors.push(`${label}: responsive has unknown property ${key}`);
    for (const key of ["compact", "wide"]) if (typeof composition.responsive[key] !== "string" || composition.responsive[key].trim() === "") errors.push(`${label}: responsive.${key} must be non-empty`);
  }
  for (const key of ["accessibilityChecks", "evidence"]) {
    if (!Array.isArray(composition[key]) || composition[key].length === 0) errors.push(`${label}: ${key} must be non-empty`);
    else if (new Set(composition[key]).size !== composition[key].length) errors.push(`${label}: ${key} must not contain duplicates`);
  }
  if (!composition.neighbors || typeof composition.neighbors !== "object") {
    errors.push(`${label}: neighbors must be an object`);
  } else {
    for (const key of Object.keys(composition.neighbors)) if (!allowedNeighborKeys.has(key)) errors.push(`${label}: neighbors has unknown property ${key}`);
    for (const key of ["before", "after"]) if (!Array.isArray(composition.neighbors[key])) errors.push(`${label}: neighbors.${key} must be an array`);
  }
  if (!composition.template || typeof composition.template !== "object") {
    errors.push(`${label}: template must be an object`);
  } else {
    for (const key of Object.keys(composition.template)) if (!allowedTemplateKeys.has(key)) errors.push(`${label}: template has unknown property ${key}`);
    if (!/^[A-Z][A-Za-z0-9]+$/.test(composition.template.component ?? "")) errors.push(`${label}: template.component must be PascalCase`);
    if (path.basename(composition.template.source ?? "", ".jsx") !== composition.template.component) errors.push(`${label}: template source must match template.component`);
    if (composition.template.style !== "templates/compositions/compositions.module.css") errors.push(`${label}: template.style must use the canonical composition stylesheet`);
    for (const file of [composition.template.source, composition.template.style]) {
      if (typeof file !== "string") continue;
      try {
        await access(path.join(registryRoot, file));
      } catch {
        errors.push(`${label}: missing template file ${file}`);
      }
    }
  }
}

for (const composition of compositions) {
  for (const key of ["before", "after"]) {
    for (const relatedId of composition.neighbors?.[key] ?? []) {
      if (!compositionIds.has(relatedId)) errors.push(`${composition.id}: neighbors.${key} references unknown composition ${relatedId}`);
      if (relatedId === composition.id) errors.push(`${composition.id}: neighbors.${key} cannot reference itself`);
    }
  }
}

const blueprintIds = new Set();
const requiredBlueprintKeys = ["id", "title", "description", "selection", "sequence", "optional", "stability", "since", "contractVersion"];
const allowedBlueprintKeys = new Set(requiredBlueprintKeys);
if (!Array.isArray(blueprints) || blueprints.length === 0) errors.push("Blueprint registry must be a non-empty array.");
for (const [index, blueprint] of blueprints.entries()) {
  const label = blueprint?.id ?? `blueprint entry ${index}`;
  for (const key of requiredBlueprintKeys) if (!(key in blueprint)) errors.push(`${label}: missing ${key}`);
  for (const key of Object.keys(blueprint)) if (!allowedBlueprintKeys.has(key)) errors.push(`${label}: unknown property ${key}`);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(blueprint.id ?? "")) errors.push(`${label}: invalid id`);
  if (blueprintIds.has(blueprint.id)) errors.push(`${label}: duplicate blueprint id`);
  blueprintIds.add(blueprint.id);
  if (!validStabilities.has(blueprint.stability)) errors.push(`${label}: invalid stability`);
  if (!/^\d+\.\d+\.\d+$/.test(blueprint.since ?? "")) errors.push(`${label}: since must be a semantic version`);
  if (blueprint.contractVersion !== 1) errors.push(`${label}: contractVersion must be 1`);
  if (!blueprint.selection || typeof blueprint.selection !== "object") errors.push(`${label}: selection must be an object`);
  else {
    for (const key of Object.keys(blueprint.selection)) if (!allowedSelectionKeys.has(key)) errors.push(`${label}: selection has unknown property ${key}`);
    for (const key of ["queries", "avoidWhen", "keywords"]) if (!Array.isArray(blueprint.selection[key]) || blueprint.selection[key].length === 0) errors.push(`${label}: selection.${key} must be non-empty`);
  }
  if (!Array.isArray(blueprint.sequence) || blueprint.sequence.length < 4) errors.push(`${label}: sequence must contain at least four compositions`);
  if (!Array.isArray(blueprint.optional)) errors.push(`${label}: optional must be an array`);
  for (const key of ["sequence", "optional"]) {
    if (new Set(blueprint[key] ?? []).size !== (blueprint[key] ?? []).length) errors.push(`${label}: ${key} must not contain duplicates`);
    for (const compositionId of blueprint[key] ?? []) if (!compositionIds.has(compositionId)) errors.push(`${label}: ${key} references unknown composition ${compositionId}`);
  }
}

if (errors.length > 0) {
  console.error(`Registry validation failed (${errors.length})`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`Registry valid: ${registry.length} components, ${compositions.length} compositions, ${blueprints.length} blueprints (${registryUrls.map(fileURLToPath).join(", ")})`);
