import { execFile } from "node:child_process";
import { mkdtemp, mkdir, readFile, rm, unlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { componentRegistry } from "@virtuecreation/composer-registry";
import { doctor, init, upgrade } from "../packages/cli/src/index.js";

const exec = promisify(execFile);
const root = await mkdtemp(path.join(os.tmpdir(), "virtue-composer-upgrade-smoke-"));
const phaseOneIds = new Set([
  "section", "visually-hidden", "button", "button-link", "action-group", "field", "input", "textarea", "select", "checkbox", "radio-group", "toggle", "badge", "callout", "empty-state", "spinner", "skeleton", "dialog", "tooltip",
]);

try {
  await mkdir(path.join(root, "src/app"), { recursive: true });
  await writeFile(path.join(root, "package.json"), `${JSON.stringify({
    name: "virtue-composer-upgrade-smoke",
    private: true,
    scripts: { build: "next build" },
    dependencies: { next: "16.2.9", react: "19.2.4", "react-dom": "19.2.4" },
  }, null, 2)}\n`);
  await init(root, { source: "local" });

  const wrapperRoot = path.join(root, "src/components/composer");
  const phaseOne = componentRegistry.filter((component) => phaseOneIds.has(component.id));
  const postPhaseOne = componentRegistry.filter((component) => !phaseOneIds.has(component.id));
  for (const component of postPhaseOne) {
    await unlink(path.join(wrapperRoot, `${component.projectImport.split("/").at(-1)}.js`));
  }
  await writeFile(path.join(wrapperRoot, "index.js"), `${phaseOne.map((component) => `export { default as ${component.title.replaceAll(" ", "")} } from "./${component.projectImport.split("/").at(-1)}";`).join("\n")}\n`);

  const customButton = 'export { default } from "@virtuecreation/composer/button";\n// project analytics wrapper preserved\n';
  await writeFile(path.join(wrapperRoot, "Button.js"), customButton);

  const foundationFile = path.join(root, "src/styles/composer.css");
  const foundation = await readFile(foundationFile, "utf8");
  await writeFile(foundationFile, foundation.replace(/\n?\/\* vc:phase-(\d+):start \*\/[\s\S]*?\/\* vc:phase-\1:end \*\/\n?/g, "\n"));
  await writeFile(path.join(root, "virtue-composer.manifest.json"), `${JSON.stringify({ contractVersion: 1, composerVersion: "0.1.0", template: "next-jsx", components: [...phaseOneIds] }, null, 2)}\n`);

  const result = await upgrade(root);
  if (!result.written.includes("Phase 2 foundation CSS")) throw new Error("Upgrade did not merge the Phase 2 foundation block.");
  if (!result.written.includes("Phase 3 foundation CSS")) throw new Error("Upgrade did not merge the Phase 3 foundation block.");
  if (!result.written.includes("Phase 4 foundation CSS")) throw new Error("Upgrade did not merge the Phase 4 foundation block.");
  if (await readFile(path.join(wrapperRoot, "Button.js"), "utf8") !== customButton) throw new Error("Upgrade overwrote the customized Button wrapper.");

  await writeFile(path.join(root, "src/app/layout.jsx"), 'import "../styles/composer.css";\nexport default function Layout({ children }) { return <html lang="en"><body>{children}</body></html>; }\n');
  await writeFile(path.join(root, "src/app/page.jsx"), 'import { AppShell, DataTable, Money, SearchResultsSummary, Stepper, Tabs, Timeline } from "@/components/composer";\nconst rows = [{ id: "atlas", name: "Atlas", status: "Ready" }];\nconst columns = [{ id: "name", header: "Project", accessor: "name", sortable: true }, { id: "status", header: "Status", accessor: "status" }];\nexport default function Page() { return <AppShell header={<strong>Composer</strong>}><h1>Upgraded fixture</h1><Stepper items={[{ id: "one", label: "Install", status: "complete" }, { id: "two", label: "Build", status: "current" }]} /><SearchResultsSummary query="Atlas" total={1} /><Money value={40} currency="CAD" /><Tabs items={[{ id: "projects", label: "Projects", content: <DataTable rows={rows} columns={columns} /> }]} /><Timeline items={[{ id: "ready", title: "Upgrade ready", date: "Today" }]} /></AppShell>; }\n');
  await writeFile(path.join(root, "jsconfig.json"), '{"compilerOptions":{"baseUrl":".","paths":{"@/*":["./src/*"]}}}\n');

  await exec("npm", ["install", "--install-links", "--no-audit", "--no-fund"], { cwd: root });
  const report = await doctor(root);
  if (!report.ok || report.summary.warnings > 0) throw new Error(`Doctor failed: ${JSON.stringify(report.findings)}`);
  await exec("npm", ["run", "build"], { cwd: root, maxBuffer: 10 * 1024 * 1024 });
  console.log(`Phase 1 upgrade smoke passed: ${postPhaseOne.length} wrappers added, customization preserved, Doctor clean, production build complete.`);
} finally {
  await rm(root, { recursive: true, force: true });
}
