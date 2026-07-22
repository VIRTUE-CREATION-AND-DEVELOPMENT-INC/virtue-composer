import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const exec = promisify(execFile);
const workspaceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const root = await mkdtemp(path.join(os.tmpdir(), "virtue-composer-cli-smoke-"));
const toolProject = path.join(root, "tool");
const consumer = path.join(root, "consumer");

async function pack(workspace) {
  const result = await exec("npm", ["pack", "--workspace", workspace, "--pack-destination", root, "--json", "--silent"], {
    cwd: workspaceRoot,
    maxBuffer: 10 * 1024 * 1024,
  });
  const tarball = path.join(root, JSON.parse(result.stdout)[0].filename);
  if (!existsSync(tarball)) throw new Error(`Package tarball was not created at ${tarball}.`);
  return tarball;
}

try {
  const registryTarball = await pack("@virtuecreation/composer-registry");
  const cliTarball = await pack("@virtuecreation/composer-cli");
  const composerTarball = await pack("@virtuecreation/composer");

  await mkdir(toolProject, { recursive: true });
  await writeFile(path.join(toolProject, "package.json"), `${JSON.stringify({
    name: "virtue-composer-cli-tool-smoke",
    private: true,
  }, null, 2)}\n`);
  await exec("npm", ["install", cliTarball, registryTarball, "--no-audit", "--no-fund"], { cwd: toolProject, maxBuffer: 10 * 1024 * 1024 });

  await mkdir(path.join(consumer, "src/app"), { recursive: true });
  await writeFile(path.join(consumer, "package.json"), `${JSON.stringify({
    name: "virtue-composer-cli-consumer",
    private: true,
    scripts: { build: "next build" },
    dependencies: { next: "16.2.10", react: "19.2.4", "react-dom": "19.2.4" },
  }, null, 2)}\n`);

  const cli = path.join(toolProject, "node_modules/.bin/virtue-composer");
  await exec(cli, ["init", consumer], { cwd: root, maxBuffer: 10 * 1024 * 1024 });
  const packageJsonFile = path.join(consumer, "package.json");
  const packageJson = JSON.parse(await readFile(packageJsonFile, "utf8"));
  if (packageJson.dependencies["@virtuecreation/composer"] !== "0.5.0") throw new Error("Packed CLI did not select Composer 0.5.0.");
  if (packageJson.devDependencies["@virtuecreation/composer-cli"] !== "0.5.0") throw new Error("Packed CLI did not pin its local binary dependency.");

  await writeFile(path.join(consumer, "src/app/layout.jsx"), 'import "../styles/composer.css";\nexport default function Layout({ children }) { return <html lang="en"><body>{children}</body></html>; }\n');
  await writeFile(path.join(consumer, "src/app/page.jsx"), 'import { Button, Section } from "@/components/composer";\nexport default function Page() { return <Section as="main" layout="flex" direction="column" align="center"><h1>CLI package rehearsal</h1><Button>Ready</Button></Section>; }\n');
  await writeFile(path.join(consumer, "jsconfig.json"), '{"compilerOptions":{"baseUrl":".","paths":{"@/*":["./src/*"]}}}\n');

  await exec("npm", ["install", composerTarball, cliTarball, registryTarball, "--no-audit", "--no-fund"], { cwd: consumer, maxBuffer: 10 * 1024 * 1024 });
  if (!existsSync(path.join(consumer, "node_modules/.bin/virtue-composer"))) throw new Error("Consumer did not receive the local virtue-composer binary.");
  const doctor = await exec(cli, ["doctor", consumer], { cwd: root, maxBuffer: 10 * 1024 * 1024 });
  if (!doctor.stdout.includes("Doctor: PASS") || !doctor.stdout.includes("0 warnings")) throw new Error(`Packed CLI Doctor failed:\n${doctor.stdout}`);
  await exec("npm", ["run", "build"], { cwd: consumer, maxBuffer: 10 * 1024 * 1024 });

  console.log("Packed CLI smoke passed: registry resolved, npm-default init complete, Doctor clean, production build complete.");
} finally {
  await rm(root, { recursive: true, force: true });
}
