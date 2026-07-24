import assert from "node:assert/strict";
import test from "node:test";
import { validateDecisionGuidance } from "../src/validate-component-metadata.js";

const decision = {
  nativeAlternative: "Use a native control.",
  complexAlternative: "Use a project-specific workflow.",
  stateModel: "Caller-owned state.",
  serverClientBoundary: "Client boundary required.",
  serialization: "Serialize a string.",
  focusOwnership: "The native control owns focus.",
  failureModes: ["Choosing it for a simpler case adds complexity."],
  compositions: []
};

test("decision-grade guidance accepts specific selection contracts", () => {
  const errors = validateDecisionGuidance({
    guidance: {
      use: "Use for a bounded interactive workflow with caller-owned data.",
      avoid: "Avoid for static content.",
      decision
    },
    runtime: { clientRequired: true }
  });
  assert.deepEqual(errors, []);
});

test("decision-grade guidance rejects generic prose and missing contracts", () => {
  const generic = validateDecisionGuidance({
    guidance: {
      use: "Use when a project needs reusable example behavior with the registered state and accessibility contract.",
      avoid: "Avoid for static content.",
      decision
    },
    security: { acceptsHtml: false }
  });
  assert.deepEqual(generic, ["decision-grade guidance cannot use the generic family-level wording"]);

  const missing = validateDecisionGuidance({
    guidance: {
      use: "Use for a bounded workflow.",
      avoid: "Avoid for static content."
    },
    runtime: { clientRequired: true }
  });
  assert.deepEqual(missing, ["decision-grade runtime or security metadata requires guidance.decision"]);
});
