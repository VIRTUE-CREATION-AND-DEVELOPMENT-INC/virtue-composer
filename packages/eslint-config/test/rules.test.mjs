import assert from "node:assert/strict";
import test from "node:test";
import { Linter } from "eslint";
import { composer } from "../index.js";

function lint(code) {
  const linter = new Linter({ configType: "flat" });
  return linter.verify(code, {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: composer.plugins,
    rules: composer.rules,
  });
}

test("selection rules reject deterministic generic component usage", () => {
  const messages = lint(`
    import { Form, Input, Money, Section, SegmentedControl } from "@/components/composer";
    export default function Example({ amount }) {
      return <Section><Form><Input type="tel" /><Input type="number" /><Input type="password" /><Money value={amount / 100} /><SegmentedControl /></Form></Section>;
    }
  `);
  assert.deepEqual(messages.map((message) => message.ruleId).sort(), [
    "virtue-composer/no-segmented-control-form-field",
    "virtue-composer/prefer-money-minor-units",
    "virtue-composer/prefer-specialized-input",
    "virtue-composer/prefer-specialized-input",
    "virtue-composer/prefer-specialized-input",
    "virtue-composer/require-explicit-section-as",
  ]);
});

test("selection rules accept explicit specialized Composer usage", () => {
  const messages = lint(`
    import { Money, NumberInput, PasswordInput, PhoneInput, RadioGroup, Section } from "@/components/composer";
    export default function Example({ amount }) {
      return <Section as="main"><PhoneInput /><NumberInput /><PasswordInput /><Money valueMinor={amount} /><RadioGroup /></Section>;
    }
  `);
  assert.deepEqual(messages, []);
});
