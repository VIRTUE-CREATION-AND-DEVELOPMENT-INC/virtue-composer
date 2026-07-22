import { execFile } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const exec = promisify(execFile);
const workspaceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const root = await mkdtemp(path.join(os.tmpdir(), "virtue-composer-compat-"));

async function pack(specifier, destination) {
  const result = await exec("npm", ["pack", specifier, "--pack-destination", destination, "--json", "--silent"], { cwd: workspaceRoot, maxBuffer: 10 * 1024 * 1024 });
  return path.join(destination, JSON.parse(result.stdout)[0].filename);
}

try {
  const publishedTarball = await pack("@virtuecreation/composer@0.4.0", root);
  const localResult = await exec("npm", ["pack", "--workspace", "@virtuecreation/composer", "--pack-destination", root, "--json", "--silent"], { cwd: workspaceRoot, maxBuffer: 10 * 1024 * 1024 });
  const localTarball = path.join(root, JSON.parse(localResult.stdout)[0].filename);
  const publishedRoot = path.join(root, "published");
  const localRoot = path.join(root, "local");
  await Promise.all([mkdir(publishedRoot), mkdir(localRoot)]);
  await Promise.all([
    exec("tar", ["-xzf", publishedTarball, "-C", publishedRoot, "--strip-components=1"]),
    exec("tar", ["-xzf", localTarball, "-C", localRoot, "--strip-components=1"]),
  ]);
  const published = JSON.parse(await readFile(path.join(publishedRoot, "package.json"), "utf8"));
  const local = JSON.parse(await readFile(path.join(localRoot, "package.json"), "utf8"));
  const failures = [];

  for (const [subpath, targets] of Object.entries(published.exports)) {
    if (!(subpath in local.exports)) {
      failures.push(`missing export subpath ${subpath}`);
      continue;
    }
    for (const [condition, target] of Object.entries(targets)) {
      if (local.exports[subpath][condition] !== target) failures.push(`${subpath} changed its ${condition} target`);
    }
  }
  for (const peer of Object.keys(published.peerDependencies ?? {})) {
    if (!(peer in (local.peerDependencies ?? {}))) failures.push(`missing peer dependency ${peer}`);
  }
  if (failures.length > 0) throw new Error(`Published compatibility check failed:\n- ${failures.join("\n- ")}`);
  console.log(`Published compatibility passed: all ${Object.keys(published.exports).length} v0.4.0 export subpaths and peer dependencies remain available.`);
} finally {
  await rm(root, { recursive: true, force: true });
}
