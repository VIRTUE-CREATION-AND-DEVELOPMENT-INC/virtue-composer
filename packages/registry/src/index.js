import coreComponents from "../components.json" with { type: "json" };
import phaseThreeComponents from "../components.phase-3.json" with { type: "json" };
import phaseFourComponents from "../components.phase-4.json" with { type: "json" };
import phaseFiveComponents from "../components.phase-5.json" with { type: "json" };
import compositions from "../compositions.json" with { type: "json" };
import blueprints from "../blueprints.json" with { type: "json" };
import stabilityEvidence from "../stability-evidence.json" with { type: "json" };

export const contractVersion = 1;
export const composerVersion = "0.7.0";
export const componentRegistry = [...coreComponents, ...phaseThreeComponents, ...phaseFourComponents, ...phaseFiveComponents];
export const compositionRegistry = compositions;
export const blueprintRegistry = blueprints;
export const componentStabilityEvidence = stabilityEvidence;

export function getComponent(id) {
  return componentRegistry.find((component) => component.id === id) ?? null;
}

export function getComposition(id) {
  return compositionRegistry.find((composition) => composition.id === id) ?? null;
}

export function getBlueprint(id) {
  return blueprintRegistry.find((blueprint) => blueprint.id === id) ?? null;
}
