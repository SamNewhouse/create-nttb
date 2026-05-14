#!/usr/bin/env node
import { execSync, spawnSync, SpawnSyncOptions } from "child_process";
import path from "path";
import fs from "fs";

function writeLine(msg: string): void {
  const width = process.stdout.columns || 80;
  const blank = " ".repeat(width);
  process.stdout.write(`\r${blank}\r${msg}`);
}

function clearLine(): void {
  const width = process.stdout.columns || 80;
  const blank = " ".repeat(width);
  process.stdout.write(`\r${blank}\r`);
}

function step(label: string): void {
  writeLine(label + "...");
}

function doneStep(): void {
  clearLine();
}

export function validateProjectName(name: string): void {
  if (!/^[a-z0-9]([a-z0-9-_]*[a-z0-9])?$/i.test(name)) {
    throw new Error(
      `Invalid project name "${name}". Use only letters, numbers, hyphens, and underscores.`,
    );
  }
  if (name.length > 214) {
    throw new Error("Project name must be 214 characters or fewer.");
  }
}

export function checkNodeVersion(minMajor: number = 20): void {
  const [major] = process.version.replace("v", "").split(".");
  if (Number(major) < minMajor) throw new Error(`Node.js v${minMajor}+ required`);
}

export function checkNpmVersion(minMajor: number = 10): void {
  let version: string;
  try {
    version = execSync("npm --version", { encoding: "utf8" }).trim();
  } catch {
    throw new Error("npm is not installed or not accessible.");
  }
  const [major] = version.split(".");
  if (Number(major) < minMajor) throw new Error(`npm v${minMajor}+ required (found v${version})`);
}

export function createProjectDirectory(projectPath: string): void {
  if (fs.existsSync(projectPath)) {
    if (fs.readdirSync(projectPath).length === 0) return;
    throw new Error(`Directory "${path.basename(projectPath)}" exists and is not empty.`);
  }
  fs.mkdirSync(projectPath, { recursive: true });
}

export function runCommand(
  command: string,
  args: string[] = [],
  options: SpawnSyncOptions = {},
): void {
  const result = spawnSync(command, args, { stdio: "ignore", ...options });
  if (!result || typeof result !== "object") throw new Error(`${command} failed`);
  if (result.error) throw new Error(result.error.message || `${command} failed`);
  if (result.status !== 0) throw new Error(`${command} failed`);
}

export function copyTemplate(templateDir: string, projectPath: string): void {
  fs.cpSync(templateDir, projectPath, { recursive: true });
}

export function updatePackageJson(projectPath: string, projectName: string): void {
  const file = path.join(projectPath, "package.json");
  const pkg = JSON.parse(fs.readFileSync(file, "utf8"));
  const updated = {
    ...pkg,
    name: projectName,
    version: "1.0.0",
    description: `${projectName} app`,
    private: true,
    keywords: [
      "create-nttb",
      "nextjs",
      "react",
      "typescript",
      "tailwindcss",
      "boilerplate",
      projectName,
    ],
  };
  fs.writeFileSync(file, JSON.stringify(updated, null, 2));
}

export async function main(): Promise<void> {
  const name = process.argv[2];
  if (!name) {
    console.error("Please provide a project name.");
    process.exit(1);
  }

  const projectPath = path.join(process.cwd(), name);
  const templateDir = path.join(__dirname, "..", "template");

  try {
    step("Validating project name");
    validateProjectName(name);
    doneStep();

    step("Checking Node version");
    checkNodeVersion();
    doneStep();

    step("Checking npm version");
    checkNpmVersion();
    doneStep();

    step("Creating project");
    createProjectDirectory(projectPath);
    doneStep();

    step("Copying template");
    copyTemplate(templateDir, projectPath);
    doneStep();

    step("Updating package.json");
    updatePackageJson(projectPath, name);
    doneStep();

    step("Installing packages");
    runCommand("npm", ["install"], { cwd: projectPath });
    doneStep();

    clearLine();
    console.log(`\nInstallation complete\n\n Next steps:\n\n cd ${name}\n npm run dev\n`);
  } catch (err) {
    clearLine();
    if (fs.existsSync(projectPath)) {
      fs.rmSync(projectPath, { recursive: true, force: true });
    }
    throw err;
  }
}

export default {
  validateProjectName,
  checkNodeVersion,
  checkNpmVersion,
  createProjectDirectory,
  runCommand,
  copyTemplate,
  updatePackageJson,
  main,
};

if (require.main === module) {
  main().catch((err) => {
    clearLine();
    console.error("Error:", err.message);
    process.exit(1);
  });
}
