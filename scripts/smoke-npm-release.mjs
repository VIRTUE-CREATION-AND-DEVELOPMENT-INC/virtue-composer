import { execFile } from "node:child_process";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";

const exec = promisify(execFile);
const root = await mkdtemp(path.join(os.tmpdir(), "virtue-composer-npm-release-"));
const project = path.join(root, "consumer");
const workspacePackage = JSON.parse(
  await readFile(new URL("../package.json", import.meta.url), "utf8"),
);
const releaseVersion = workspacePackage.version;
const npmArgs = ["--yes", `@virtuecreation/composer-cli@${releaseVersion}`];

try {
  await mkdir(path.join(project, "src/app"), { recursive: true });
  await writeFile(path.join(project, "package.json"), `${JSON.stringify({
    name: "virtue-composer-npm-consumer",
    private: true,
    scripts: { build: "next build" },
    dependencies: { next: "16.2.11", react: "19.2.4", "react-dom": "19.2.4" },
  }, null, 2)}\n`);

  await exec("npx", [...npmArgs, "init", project], { cwd: root, maxBuffer: 10 * 1024 * 1024 });
  await writeFile(path.join(project, "src/app/layout.jsx"), 'import "../styles/composer.css";\nexport default function Layout({ children }) { return <html lang="en"><body>{children}</body></html>; }\n');
  await writeFile(path.join(project, "src/app/page.jsx"), 'import { Button, Section } from "@/components/composer";\nexport default function Page() { return <Section as="main" layout="flex" direction="column" align="center"><h1>npm release rehearsal</h1><Button>Ready</Button></Section>; }\n');
  await writeFile(path.join(project, "jsconfig.json"), '{"compilerOptions":{"baseUrl":".","paths":{"@/*":["./src/*"]}}}\n');

  await exec("npm", ["install", "--no-audit", "--no-fund"], { cwd: project, maxBuffer: 10 * 1024 * 1024 });
  const composer = JSON.parse(await readFile(path.join(project, "node_modules/@virtuecreation/composer/package.json"), "utf8"));
  if (composer.name !== "@virtuecreation/composer" || composer.version !== releaseVersion) {
    throw new Error(`Unexpected Composer install: ${composer.name}@${composer.version}`);
  }

  const doctor = await exec("npx", [...npmArgs, "doctor", project], { cwd: root, maxBuffer: 10 * 1024 * 1024 });
  if (!doctor.stdout.includes("Doctor: PASS") || !doctor.stdout.includes("0 warnings")) throw new Error(`npm CLI Doctor failed:\n${doctor.stdout}`);
  await exec("npm", ["run", "build"], { cwd: project, maxBuffer: 10 * 1024 * 1024 });

  console.log("npm release smoke passed: public CLI download, Composer install, Doctor, and production build complete.");
} finally {
  await rm(root, { recursive: true, force: true });
}
