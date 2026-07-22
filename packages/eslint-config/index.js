const visualSectionProps = new Set(["surface", "width", "minWidth", "maxWidth", "height", "minHeight", "maxHeight", "padding", "background", "border", "radius", "shadow"]);
const rawControls = new Set(["button", "input", "select", "textarea"]);

function jsxName(node) {
  return node.type === "JSXIdentifier" ? node.name : null;
}

const plugin = {
  meta: { name: "@virtuecreation/eslint-config-composer", version: "0.5.0" },
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
    "virtue-composer/prefer-section-layout": "warn"
  },
};

export default composer;
