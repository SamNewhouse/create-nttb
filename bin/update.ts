import fs from "fs";
import path from "path";
import { spawnSync, SpawnSyncOptions } from "child_process";

export function runCommand(
  command: string,
  args: string[] = [],
  options: SpawnSyncOptions = {},
): void {
  const result = spawnSync(command, args, { stdio: "inherit", ...options });

  if (!result || typeof result !== "object") {
    throw new Error(`${command} failed`);
  }

  if (result.error) {
    throw new Error(result.error.message || `${command} failed`);
  }

  if (result.status !== 0) {
    throw new Error(`${command} failed`);
  }
}

export function getPackageJson(projectPath: string): Record<string, any> {
  const packageJsonPath = path.join(projectPath, "package.json");

  if (!fs.existsSync(packageJsonPath)) {
    throw new Error(`No package.json found in "${projectPath}".`);
  }

  return JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
}

export async function main(targetDir?: string): Promise<void> {
  const projectPath = targetDir
    ? path.resolve(process.cwd(), targetDir)
    : process.cwd();

  const pkg = getPackageJson(projectPath);

  if (!pkg.createNttbVersion) {
    throw new Error(
      `This does not look like a create-nttb project: "${projectPath}". Missing createNttbVersion in package.json.`,
    );
  }

  console.log(`Updating package.json dependencies in ${projectPath}...`);
  runCommand("npx", ["npm-check-updates", "-u"], { cwd: projectPath });

  console.log("Installing updated packages...");
  runCommand("npm", ["install"], { cwd: projectPath });

  const scripts = pkg.scripts ?? {};

  if (scripts.lint) {
    console.log("Running lint...");
    runCommand("npm", ["run", "lint"], { cwd: projectPath });
  }

  if (scripts.build) {
    console.log("Running build...");
    runCommand("npm", ["run", "build"], { cwd: projectPath });
  }

  console.log("Update complete.");
}
