import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { doctor, init } from "../packages/cli/src/index.js";

const exec = promisify(execFile);
const workspaceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const root = await mkdtemp(path.join(os.tmpdir(), "virtue-composer-package-smoke-"));
const project = path.join(root, "consumer");

async function useLocalTooling(target) {
  const packageFile = path.join(target, "package.json");
  const packageJson = JSON.parse(await readFile(packageFile, "utf8"));
  packageJson.devDependencies["@virtuecreation/composer-cli"] = `file:${path.join(workspaceRoot, "packages/cli")}`;
  packageJson.devDependencies["@virtuecreation/composer-registry"] = `file:${path.join(workspaceRoot, "packages/registry")}`;
  await writeFile(packageFile, `${JSON.stringify(packageJson, null, 2)}\n`);
}

try {
  const packed = await exec("npm", ["pack", "--workspace", "@virtuecreation/composer", "--pack-destination", root, "--json", "--silent"], { cwd: workspaceRoot, maxBuffer: 10 * 1024 * 1024 });
  const packResult = JSON.parse(packed.stdout);
  const tarball = path.join(root, packResult[0].filename);
  if (!existsSync(tarball)) throw new Error(`Composer tarball was not created at ${tarball}.`);

  await mkdir(path.join(project, "src/app"), { recursive: true });
  await writeFile(path.join(project, "package.json"), `${JSON.stringify({
    name: "virtue-composer-package-consumer",
    private: true,
    scripts: { build: "next build" },
    dependencies: { next: "16.2.10", react: "19.2.4", "react-dom": "19.2.4" },
  }, null, 2)}\n`);
  await init(project, { source: "npm", dependency: `file:${tarball}` });
  await useLocalTooling(project);
  await writeFile(path.join(project, "src/app/layout.jsx"), 'import "../styles/composer.css";\nexport default function Layout({ children }) { return <html lang="en"><body>{children}</body></html>; }\n');
  await writeFile(path.join(project, "src/app/page.jsx"), 'import { Button, Checkbox, CodeBlock, Field, Input, Money, ResourceBoundary, Section } from "@/components/composer";\nexport default function Page() { return <Section as="main" layout="flex" direction="column" gap="medium"><h1>Published package rehearsal</h1><Money valueMinor={4000} currency="CAD" /><Field label="Email"><Input name="email" /></Field><Checkbox label="Subscribe" /><CodeBlock code="npm install @virtuecreation/composer" /><ResourceBoundary><Button>Ready</Button></ResourceBoundary></Section>; }\n');
  await writeFile(path.join(project, "jsconfig.json"), '{"compilerOptions":{"baseUrl":".","paths":{"@/*":["./src/*"]}}}\n');

  await exec("npm", ["install", "--no-audit", "--no-fund"], { cwd: project, maxBuffer: 10 * 1024 * 1024 });
  const installedPackage = JSON.parse(await readFile(path.join(project, "node_modules/@virtuecreation/composer/package.json"), "utf8"));
  if (installedPackage.name !== "@virtuecreation/composer" || installedPackage.version !== "0.5.0") throw new Error(`Unexpected installed package: ${installedPackage.name}@${installedPackage.version}`);
  if (!existsSync(path.join(project, "node_modules/@virtuecreation/composer/dist/Button.js"))) throw new Error("Packed Composer is missing dist/Button.js.");
  if (existsSync(path.join(project, "node_modules/@virtuecreation/composer/src"))) throw new Error("Packed Composer unexpectedly contains source files.");

  const report = await doctor(project);
  if (!report.ok || report.summary.warnings > 0) throw new Error(`Doctor failed: ${JSON.stringify(report.findings)}`);
  await exec("npm", ["run", "build"], { cwd: project, maxBuffer: 10 * 1024 * 1024 });
  console.log(`Published-package smoke passed: ${packResult[0].size} byte tarball, clean install, Doctor clean, production build complete.`);
} finally {
  await rm(root, { recursive: true, force: true });
}
