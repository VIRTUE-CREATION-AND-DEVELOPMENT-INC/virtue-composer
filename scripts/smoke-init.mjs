import { execFile } from "node:child_process";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { compose, doctor, init } from "../packages/cli/src/index.js";

const exec = promisify(execFile);
const workspaceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const root = await mkdtemp(path.join(os.tmpdir(), "virtue-composer-smoke-"));

async function useLocalTooling(project) {
  const packageFile = path.join(project, "package.json");
  const packageJson = JSON.parse(await readFile(packageFile, "utf8"));
  packageJson.devDependencies["@virtuecreation/composer-cli"] = `file:${path.join(workspaceRoot, "packages/cli")}`;
  packageJson.devDependencies["@virtuecreation/composer-registry"] = `file:${path.join(workspaceRoot, "packages/registry")}`;
  await writeFile(packageFile, `${JSON.stringify(packageJson, null, 2)}\n`);
}

try {
  await mkdir(path.join(root, "src/app"), { recursive: true });
  await writeFile(path.join(root, "package.json"), `${JSON.stringify({
    name: "virtue-composer-smoke",
    private: true,
    scripts: { build: "next build" },
    dependencies: { next: "16.2.9", react: "19.2.4", "react-dom": "19.2.4" },
  }, null, 2)}\n`);
  await init(root, { source: "local" });
  await compose(root, { compositions: "faq-split-accordion,services-media-grid,proof-metric-strip" });
  await useLocalTooling(root);
  await writeFile(path.join(root, "src/app/layout.jsx"), 'import "../styles/composer.css";\nexport default function Layout({ children }) { return <html lang="en"><body>{children}</body></html>; }\n');
  await writeFile(path.join(root, "src/app/page.jsx"), 'import { AppShell, Button, Field, InlineMessage, Input, Money, Section, Stepper } from "@/components/composer";\nimport { FAQSplitAccordion, ProofMetricStrip, ServicesMediaGrid } from "@/components/compositions";\nconst image = { src: "/fixture.svg", alt: "Abstract service placeholder", width: 1200, height: 800 };\nexport default function Page() { return <AppShell header={<strong>Composer</strong>}><Section as="main" layout="flex" direction="column" gap="medium"><h1>Smoke fixture</h1><Stepper items={[{ id: "one", label: "Install", status: "current" }]} /><Field label="Name"><Input /></Field><Money valueMinor={4000} currency="CAD" /><InlineMessage tone="success">Ready</InlineMessage><Button>Submit</Button><ServicesMediaGrid items={[{ title: "Foundation", description: "A durable starting point.", image }]} /><ProofMetricStrip metrics={[{ value: "18", label: "Compositions" }]} /><FAQSplitAccordion items={[{ question: "Ready?", answer: "Ready." }]} /></Section></AppShell>; }\n');
  await writeFile(path.join(root, "jsconfig.json"), '{"compilerOptions":{"baseUrl":".","paths":{"@/*":["./src/*"]}}}\n');
  await exec("npm", ["install", "--install-links", "--no-audit", "--no-fund"], { cwd: root });
  const report = await doctor(root);
  if (!report.ok || report.summary.warnings > 0) throw new Error(`Doctor failed: ${JSON.stringify(report.findings)}`);
  await exec("npm", ["run", "build"], { cwd: root, maxBuffer: 10 * 1024 * 1024 });
  console.log(`Fresh-project smoke passed: ${report.scannedFiles} files, 0 errors, 0 warnings, production build complete.`);
} finally {
  await rm(root, { recursive: true, force: true });
}
