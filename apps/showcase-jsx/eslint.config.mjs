import { composer } from "@virtuecreation/eslint-config-composer";

export default [
  { ignores: [".next/**", "node_modules/**"] },
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: { ecmaVersion: "latest", sourceType: "module", parserOptions: { ecmaFeatures: { jsx: true } } },
    ...composer,
  },
];
