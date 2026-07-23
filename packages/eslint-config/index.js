const visualSectionProps = new Set(["surface", "width", "minWidth", "maxWidth", "height", "minHeight", "maxHeight", "padding", "background", "border", "radius", "shadow"]);
const rawControls = new Set(["button", "input", "select", "textarea"]);

function jsxName(node) {
  return node.type === "JSXIdentifier" ? node.name : null;
}

function jsxAttribute(node, name) {
  return node.attributes.find((attribute) => attribute.type === "JSXAttribute" && attribute.name.name === name);
}

function jsxLiteralValue(attribute) {
  if (!attribute?.value) return true;
  if (attribute.value.type === "Literal") return attribute.value.value;
  return undefined;
}

function hasJsxAncestor(node, name) {
  let current = node.parent;
  while (current) {
    if (current.type === "JSXElement" && jsxName(current.openingElement.name) === name) return true;
    current = current.parent;
  }
  return false;
}

function collectComposerImports(node, context, localNames) {
  const source = node.source.value;
  const configuredAlias = context.settings?.["virtue-composer"]?.importAlias;
  const aliases = ["@/components/composer", configuredAlias].filter(Boolean);
  const packageSource = /^@virtue(?:creation)?\/composer(?:\/|$)/.test(source);
  const alias = aliases.find((candidate) => source === candidate || source.startsWith(`${candidate}/`));
  if (!packageSource && !alias) return;
  const subpath = alias && source.startsWith(`${alias}/`) ? source.slice(alias.length + 1) : packageSource ? source.split("/").at(-1) : null;
  for (const specifier of node.specifiers) {
    if (specifier.type === "ImportSpecifier") localNames.set(specifier.local.name, specifier.imported.name);
    else if (specifier.type === "ImportDefaultSpecifier" && subpath) localNames.set(specifier.local.name, subpath);
  }
}

const plugin = {
  meta: { name: "@virtuecreation/eslint-config-composer", version: "0.6.0" },
  rules: {
    "no-direct-package-import": {
      meta: { type: "problem", messages: { default: "Import Composer components from the project's local wrapper layer." }, schema: [] },
      create(context) {
        const filename = context.filename.replaceAll("\\", "/");
        const isWrapper = filename.includes("/components/composer/");
        return {
          ImportDeclaration(node) {
            if (!isWrapper && /^@virtue(?:creation)?\/composer(?:\/|$)/.test(node.source.value)) context.report({ node, messageId: "default" });
          },
          ExportNamedDeclaration(node) {
            if (!isWrapper && node.source && /^@virtue(?:creation)?\/composer(?:\/|$)/.test(node.source.value)) context.report({ node, messageId: "default" });
          },
        };
      },
    },
    "no-raw-controls": {
      meta: { type: "problem", messages: { default: "Use the local Composer {{name}} wrapper." }, schema: [] },
      create(context) {
        const isWrapper = context.filename.replaceAll("\\", "/").includes("/components/composer/");
        return {
          JSXOpeningElement(node) {
            const name = jsxName(node.name);
            if (!isWrapper && rawControls.has(name)) context.report({ node, messageId: "default", data: { name } });
          },
        };
      },
    },
    "section-layout-only": {
      meta: { type: "problem", messages: { default: "Section cannot own visual prop '{{name}}'; use a project class instead." }, schema: [] },
      create(context) {
        return {
          JSXOpeningElement(node) {
            if (jsxName(node.name) !== "Section") return;
            for (const attribute of node.attributes) {
              if (attribute.type === "JSXAttribute" && visualSectionProps.has(attribute.name.name)) {
                context.report({ node: attribute, messageId: "default", data: { name: attribute.name.name } });
              }
            }
          },
        };
      },
    },
    "require-explicit-section-as": {
      meta: { type: "problem", messages: { default: "Declare Section with an explicit semantic `as` value, or as=\"div\" for layout-only grouping." }, schema: [] },
      create(context) {
        return {
          JSXOpeningElement(node) {
            if (jsxName(node.name) === "Section" && !jsxAttribute(node, "as")) context.report({ node, messageId: "default" });
          },
        };
      },
    },
    "prefer-specialized-input": {
      meta: { type: "problem", messages: { default: "Use the local Composer {{component}} wrapper instead of generic Input type=\"{{type}}\"." }, schema: [] },
      create(context) {
        const replacements = { tel: "PhoneInput", number: "NumberInput", password: "PasswordInput" };
        const localNames = new Map();
        return {
          ImportDeclaration(node) {
            collectComposerImports(node, context, localNames);
          },
          JSXOpeningElement(node) {
            if (localNames.get(jsxName(node.name)) !== "Input") return;
            const type = jsxLiteralValue(jsxAttribute(node, "type"));
            if (typeof type === "string" && replacements[type]) context.report({ node, messageId: "default", data: { component: replacements[type], type } });
          },
        };
      },
    },
    "prefer-money-minor-units": {
      meta: { type: "problem", messages: { default: "Pass integer currency values through Money.valueMinor instead of dividing by 100 into the legacy value prop." }, schema: [] },
      create(context) {
        const localNames = new Map();
        return {
          ImportDeclaration(node) {
            collectComposerImports(node, context, localNames);
          },
          JSXOpeningElement(node) {
            if (localNames.get(jsxName(node.name)) !== "Money") return;
            const value = jsxAttribute(node, "value")?.value;
            const expression = value?.type === "JSXExpressionContainer" ? value.expression : null;
            if (expression?.type === "BinaryExpression" && expression.operator === "/" && expression.right?.type === "Literal" && expression.right.value === 100) context.report({ node, messageId: "default" });
          },
        };
      },
    },
    "no-segmented-control-form-field": {
      meta: { type: "suggestion", messages: { default: "Use RadioGroup for a submitted single-choice Form field; SegmentedControl is intended for navigation or mode selection." }, schema: [] },
      create(context) {
        const localNames = new Map();
        return {
          ImportDeclaration(node) {
            collectComposerImports(node, context, localNames);
          },
          JSXOpeningElement(node) {
            if (localNames.get(jsxName(node.name)) !== "SegmentedControl") return;
            const formLocalNames = [...localNames.entries()].filter(([, imported]) => imported === "Form").map(([local]) => local);
            if (formLocalNames.some((local) => hasJsxAncestor(node, local))) context.report({ node, messageId: "default" });
          },
        };
      },
    },
    "prefer-section-layout": {
      meta: { type: "suggestion", messages: { default: "Use Section for layout-bearing divs when the element is structural." }, schema: [] },
      create(context) {
        return {
          JSXOpeningElement(node) {
            if (jsxName(node.name) !== "div") return;
            const classAttribute = node.attributes.find((attribute) => attribute.type === "JSXAttribute" && attribute.name.name === "className");
            if (classAttribute?.value?.type === "Literal" && /\b(flex|grid)\b/.test(classAttribute.value.value)) context.report({ node, messageId: "default" });
          },
        };
      },
    },
  },
};

export const composer = {
  plugins: { "virtue-composer": plugin },
  rules: {
    "virtue-composer/no-direct-package-import": "error",
    "virtue-composer/no-raw-controls": "error",
    "virtue-composer/section-layout-only": "error",
    "virtue-composer/require-explicit-section-as": "error",
    "virtue-composer/prefer-specialized-input": "error",
    "virtue-composer/prefer-money-minor-units": "error",
    "virtue-composer/no-segmented-control-form-field": "warn",
    "virtue-composer/prefer-section-layout": "warn"
  },
};

export default composer;
