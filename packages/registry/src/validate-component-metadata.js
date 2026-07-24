const requiredDecisionKeys = [
  "nativeAlternative",
  "complexAlternative",
  "stateModel",
  "serverClientBoundary",
  "serialization",
  "focusOwnership",
  "failureModes",
  "compositions"
];
const allowedDecisionKeys = new Set(requiredDecisionKeys);
const genericGuidancePattern = /project needs reusable .* behavior with the registered state and accessibility contract/i;
const isNonEmptyString = (value) => typeof value === "string" && value.trim() !== "";

export function validateDecisionGuidance(component) {
  const errors = [];
  const decisionRequired = Boolean(component.runtime || component.security || component.guidance?.decision);
  const decision = component.guidance?.decision;
  if (decisionRequired && (!decision || typeof decision !== "object" || Array.isArray(decision))) {
    return ["decision-grade runtime or security metadata requires guidance.decision"];
  }
  if (!decision) return errors;

  for (const key of requiredDecisionKeys) if (!(key in decision)) errors.push(`guidance.decision is missing ${key}`);
  for (const key of Object.keys(decision)) if (!allowedDecisionKeys.has(key)) errors.push(`guidance.decision has unknown property ${key}`);
  for (const key of requiredDecisionKeys.filter((key) => !["failureModes", "compositions"].includes(key))) {
    if (!isNonEmptyString(decision[key])) errors.push(`guidance.decision.${key} must be a non-empty string`);
  }
  for (const key of ["failureModes", "compositions"]) {
    if (!Array.isArray(decision[key])) errors.push(`guidance.decision.${key} must be an array`);
    else if (new Set(decision[key]).size !== decision[key].length) errors.push(`guidance.decision.${key} must not contain duplicates`);
  }
  if (Array.isArray(decision.failureModes) && decision.failureModes.length === 0) errors.push("guidance.decision.failureModes must not be empty");
  if (genericGuidancePattern.test(component.guidance.use) || genericGuidancePattern.test(component.guidance.avoid)) {
    errors.push("decision-grade guidance cannot use the generic family-level wording");
  }
  return errors;
}
