import coreComponents from "../components.json" with { type: "json" };
import phaseThreeComponents from "../components.phase-3.json" with { type: "json" };
import phaseFourComponents from "../components.phase-4.json" with { type: "json" };

export const contractVersion = 1;
export const composerVersion = "0.4.0";
export const componentRegistry = [...coreComponents, ...phaseThreeComponents, ...phaseFourComponents];

export function getComponent(id) {
  return componentRegistry.find((component) => component.id === id) ?? null;
}
