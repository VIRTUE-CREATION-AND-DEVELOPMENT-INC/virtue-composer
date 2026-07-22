import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { doctor, init, inspect } from "../packages/cli/src/index.js";

const exec = promisify(execFile);
const root = await mkdtemp(path.join(os.tmpdir(), "virtue-composer-root-smoke-"));

try {
  await mkdir(path.join(root, "app"), { recursive: true });
  await writeFile(path.join(root, "package.json"), `${JSON.stringify({
    name: "virtue-composer-root-smoke",
    private: true,
    scripts: { build: "next build" },
    dependencies: { next: "16.2.9", react: "19.2.4", "react-dom": "19.2.4" },
  }, null, 2)}\n`);
  await writeFile(path.join(root, "jsconfig.json"), '{"compilerOptions":{"paths":{"@/*":["./*"]}}}\n');
  const initialized = await init(root, { source: "local", components: "Section,Button,Money" });
  if (initialized.structure.sourceRoot !== "." || initialized.structure.wrapperRoot !== "components/composer") throw new Error(`Root layout was not detected: ${JSON.stringify(initialized.structure)}`);
  await writeFile(path.join(root, "app/layout.jsx"), 'import "../styles/composer.css";\nexport default function Layout({ children }) { return <html lang="en"><body>{children}</body></html>; }\n');
  await writeFile(path.join(root, "app/page.jsx"), 'import { Button, Money, Section } from "@/components/composer";\nexport default function Page() { return <Section as="main" layout="grid" gap="medium"><h1>Root fixture</h1><Money valueMinor={4000} currency="CAD" /><Button>Ready</Button></Section>; }\n');
  await exec("npm", ["install", "--install-links", "--no-audit", "--no-fund"], { cwd: root, maxBuffer: 10 * 1024 * 1024 });
  if (!existsSync(path.join(root, "node_modules/.bin/virtue-composer"))) throw new Error("The initialized project does not have a local virtue-composer binary.");
  const jsconfig = JSON.parse(await readFile(path.join(root, "jsconfig.json"), "utf8"));
  if (jsconfig.compilerOptions.paths["@/components/composer"]?.[0] !== "./components/composer/index.js") throw new Error("Root Composer alias was not generated.");
  const report = await doctor(root);
  if (!report.ok || report.summary.warnings > 0) throw new Error(`Doctor failed: ${JSON.stringify(report.findings)}`);
  const usage = await inspect(root, { used: true, compact: true });
  if (usage.summary.installed !== 3 || usage.summary.wrapped !== 3 || usage.summary.used !== 3) throw new Error(`Unexpected usage report: ${JSON.stringify(usage.summary)}`);
  await exec("npm", ["run", "build"], { cwd: root, maxBuffer: 10 * 1024 * 1024 });
  console.log("Root-project smoke passed: detected aliases, 3 on-demand wrappers, local CLI, Doctor, usage report, and production build complete.");
} finally {
  await rm(root, { recursive: true, force: true });
}
