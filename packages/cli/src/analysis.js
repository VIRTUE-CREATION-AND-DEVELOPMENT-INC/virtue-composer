import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { parse } from "@babel/parser";
import postcss from "postcss";

const composerPackagePattern = /^@virtue(?:creation)?\/composer(?:\/[\w-]+)?$/;
const rawControls = new Set(["button", "input", "select", "textarea"]);
const visualSectionProps = new Set(["style", "surface", "width", "minWidth", "maxWidth", "height", "minHeight", "maxHeight", "padding", "background", "border", "radius", "shadow"]);

function parseSource(source, file) {
  return parse(source, {
    sourceType: "unambiguous",
    sourceFilename: file,
    errorRecovery: false,
    plugins: ["jsx", "typescript", "decorators-legacy", "classProperties", "dynamicImport"],
  });
}

function walk(node, visit, ancestors = []) {
  if (!node || typeof node !== "object") return;
  visit(node, ancestors);
  const nextAncestors = [...ancestors, node];
  for (const [key, value] of Object.entries(node)) {
    if (key === "loc" || key === "start" || key === "end" || key === "extra") continue;
    if (Array.isArray(value)) for (const child of value) walk(child, visit, nextAncestors);
    else if (value && typeof value === "object" && typeof value.type === "string") walk(value, visit, nextAncestors);
  }
}

function jsxName(node) {
  if (node?.type === "JSXIdentifier") return node.name;
  if (node?.type === "JSXMemberExpression") return `${jsxName(node.object)}.${jsxName(node.property)}`;
  return "";
}

function attributeName(attribute) {
  return attribute?.type === "JSXAttribute" && attribute.name?.type === "JSXIdentifier" ? attribute.name.name : undefined;
}

function attributeValue(attribute) {
  if (!attribute?.value) return true;
  if (attribute.value.type === "StringLiteral") return attribute.value.value;
  if (attribute.value.type === "JSXExpressionContainer") return attribute.value.expression;
  return undefined;
}

function memberReference(node) {
  if (node?.type !== "MemberExpression" && node?.type !== "OptionalMemberExpression") return null;
  if (node.object?.type !== "Identifier") return null;
  const property = node.computed
    ? node.property?.type === "StringLiteral" ? node.property.value : undefined
    : node.property?.type === "Identifier" ? node.property.name : undefined;
  return property ? { object: node.object.name, property } : null;
}

function expressionHasLayoutClass(node, cssModules) {
  let detected = false;
  walk(node, (child) => {
    if (detected) return;
    if (child.type === "StringLiteral" && /(?:^|\s)(?:flex|grid)(?:\s|$)/.test(child.value)) detected = true;
    if (child.type === "TemplateElement" && /(?:^|\s)(?:flex|grid)(?:\s|$)/.test(child.value.raw)) detected = true;
    const reference = memberReference(child);
    if (reference && cssModules.get(reference.object)?.has(reference.property)) detected = true;
  });
  return detected;
}

function expressionHasInlineLayout(node) {
  if (node?.type !== "ObjectExpression") return false;
  return node.properties.some((property) => {
    if (property.type !== "ObjectProperty") return false;
    const key = property.key?.type === "Identifier" ? property.key.name : property.key?.value;
    const value = property.value?.type === "StringLiteral" ? property.value.value : undefined;
    return key === "display" && (value === "flex" || value === "grid");
  });
}

async function loadCssModuleLayouts(ast, absoluteFile) {
  const layouts = new Map();
  const imports = ast.program.body.filter((node) => node.type === "ImportDeclaration" && /\.module\.css$/.test(node.source.value));
  for (const declaration of imports) {
    const local = declaration.specifiers.find((specifier) => specifier.local)?.local.name;
    if (!local) continue;
    const cssFile = path.resolve(path.dirname(absoluteFile), declaration.source.value);
    if (!existsSync(cssFile)) continue;
    const css = await readFile(cssFile, "utf8");
    const classNames = new Set();
    postcss.parse(css, { from: cssFile }).walkRules((rule) => {
      let ownsLayout = false;
      rule.walkDecls("display", (declarationNode) => {
        if (/^(?:inline-)?(?:flex|grid)$/.test(declarationNode.value.trim())) ownsLayout = true;
      });
      if (!ownsLayout) return;
      for (const match of rule.selector.matchAll(/\.([_a-zA-Z][\w-]*)/g)) classNames.add(match[1]);
    });
    layouts.set(local, classNames);
  }
  return layouts;
}

function importUsage(ast, importAlias) {
  const names = new Set();
  const localNames = new Map();
  walk(ast, (node) => {
    if (node.type !== "ImportDeclaration") return;
    const source = node.source.value;
    if (source !== importAlias && !source.startsWith(`${importAlias}/`)) return;
    const subpathName = source.startsWith(`${importAlias}/`) ? source.slice(importAlias.length + 1) : null;
    if (subpathName) names.add(subpathName);
    for (const specifier of node.specifiers) {
      if (specifier.type === "ImportSpecifier") {
        const importedName = specifier.imported.name ?? specifier.imported.value;
        names.add(importedName);
        localNames.set(specifier.local.name, importedName);
      } else if (specifier.type === "ImportDefaultSpecifier" && subpathName) {
        names.add(subpathName);
        localNames.set(specifier.local.name, subpathName);
      }
    }
  });
  return { names, localNames };
}

function canonicalJsxName(node, localNames) {
  const name = jsxName(node);
  return localNames.get(name) ?? name;
}

function selectionHintMatches(node, ancestors, hint, localNames) {
  const name = canonicalJsxName(node.name, localNames);
  if (hint.from !== "*" && name !== hint.from) return false;
  const attributes = new Map(node.attributes.map((attribute) => [attributeName(attribute), attribute]).filter(([key]) => key));
  if (hint.rule === "jsx-prop-equals") return attributeValue(attributes.get(hint.prop)) === hint.value;
  if (hint.rule === "jsx-prop-divisor") {
    const expression = attributeValue(attributes.get(hint.prop));
    return expression?.type === "BinaryExpression" && expression.operator === "/" && expression.right?.type === "NumericLiteral" && expression.right.value === hint.value;
  }
  if (hint.rule === "jsx-ancestor") {
    return ancestors.some((ancestor) => ancestor.type === "JSXElement" && canonicalJsxName(ancestor.openingElement.name, localNames) === hint.ancestor);
  }
  return false;
}

function candidateFromHint(hint, relativeFile, line) {
  return {
    rule: `prefer-${hint.target.id}`,
    file: relativeFile,
    line,
    current: hint.from,
    confidence: hint.confidence,
    message: hint.message,
    recommendation: {
      id: hint.target.id,
      title: hint.target.title,
      projectImport: hint.target.projectImport,
      stability: hint.target.stability,
      since: hint.target.since,
    },
  };
}

export async function analyzeSource({ source, absoluteFile, relativeFile, isWrapper, importAlias, selectionHints = [] }) {
  let ast;
  try {
    ast = parseSource(source, absoluteFile);
  } catch (error) {
    return {
      findings: [{ group: "sourceAnalysis", rule: "analysis-parse", file: relativeFile, line: error.loc?.line ?? 1, message: `Source analysis skipped: ${error.message}` }],
      usedNames: new Set(),
      candidates: [],
      parsed: false,
    };
  }

  const usage = isWrapper ? { names: new Set(), localNames: new Map() } : importUsage(ast, importAlias);
  const usedNames = usage.names;
  if (isWrapper) return { findings: [], usedNames, candidates: [], parsed: true };

  const cssModules = await loadCssModuleLayouts(ast, absoluteFile);
  const findings = [];
  const candidates = [];
  const sectionNames = new Set(["Section"]);

  for (const node of ast.program.body) {
    if (node.type !== "ImportDeclaration") continue;
    if (composerPackagePattern.test(node.source.value)) {
      findings.push({ group: "directPackageImports", rule: "direct-package-import", file: relativeFile, line: node.loc?.start.line ?? 1, message: "Import Composer through the project wrapper layer." });
    }
    if (node.source.value === importAlias) {
      for (const specifier of node.specifiers) {
        if (specifier.type === "ImportSpecifier" && (specifier.imported.name ?? specifier.imported.value) === "Section") sectionNames.add(specifier.local.name);
      }
    }
  }

  walk(ast, (node, ancestors) => {
    if (node.type !== "JSXOpeningElement") return;
    const name = canonicalJsxName(node.name, usage.localNames);
    const line = node.loc?.start.line ?? 1;
    if (rawControls.has(name)) {
      findings.push({ group: "rawControls", rule: `raw-${name}`, file: relativeFile, line, message: `Use the local Composer ${name} wrapper.` });
    }

    if (sectionNames.has(name)) {
      const attributes = new Map(node.attributes.map((attribute) => [attributeName(attribute), attribute]).filter(([key]) => key));
      for (const prop of visualSectionProps) {
        if (attributes.has(prop)) findings.push({ group: "sectionVisualProps", rule: "section-visual-prop", file: relativeFile, line, message: `Section cannot own visual prop "${prop}"; move it to project CSS.` });
      }
      if (!attributes.has("as")) findings.push({ group: "sectionSemantics", rule: "section-explicit-element", file: relativeFile, line, message: "Declare Section as an explicit semantic region or as=\"div\" for layout-only grouping." });
    }

    for (const hint of selectionHints) {
      if (!selectionHintMatches(node, ancestors, hint, usage.localNames)) continue;
      const candidate = candidateFromHint(hint, relativeFile, line);
      candidates.push(candidate);
      findings.push({ group: "componentSelection", rule: candidate.rule, file: relativeFile, line, message: candidate.message });
    }

    if (name !== "div") return;
    const className = node.attributes.find((attribute) => attributeName(attribute) === "className");
    const style = node.attributes.find((attribute) => attributeName(attribute) === "style");
    const classValue = attributeValue(className);
    const styleValue = attributeValue(style);
    const literalLayout = typeof classValue === "string" && /(?:^|\s)(?:flex|grid)(?:\s|$)/.test(classValue);
    if (literalLayout || expressionHasLayoutClass(classValue, cssModules) || expressionHasInlineLayout(styleValue)) {
      findings.push({ group: "layoutDivs", rule: "layout-div", file: relativeFile, line, message: "Consider Section as=\"div\" for this layout-bearing div (CSS Module detection is advisory)." });
    }
  });

  return { findings, usedNames, candidates, parsed: true };
}

export function componentName(component) {
  return component.projectImport.split("/").at(-1);
}
