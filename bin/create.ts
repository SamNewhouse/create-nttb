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

export function checkNodeVersion(minMajor: number = 20): void {
  const [major] = process.version.replace("v", "").split(".");
  if (Number(major) < minMajor) throw new Error(`Node.js v${minMajor}+ required`);
}

export function checkGitInstalled(): void {
  try {
    execSync("git --version", { stdio: "ignore" });
  } catch {
    throw new Error("Git is not installed. See https://git-scm.com/");
  }
}

export function createProjectDirectory(projectPath: string): void {
  if (fs.existsSync(projectPath)) {
    if (fs.readdirSync(projectPath).length === 0) return;
    throw new Error(`Directory "${projectPath}" exists and is not empty.`);
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

export function updatePackageJson(projectPath: string, projectName: string): void {
  const file = path.join(projectPath, "package.json");
  const pkg = JSON.parse(fs.readFileSync(file, "utf8"));
  const updated = {
    ...pkg,
    name: projectName,
    version: "1.0.0",
    description: `${projectName} app description`,
    keywords: [
      "create-nttb",
      "nextjs",
      "react",
      "typescript",
      "tailwindcss",
      "boilerplate",
      projectName,
    ],
    scripts: {
      dev: "next dev",
      build: "next build",
      start: "next start",
      format: "prettier --write .",
      test: "jest",
    },
  };
  for (const key of ["author", "bin", "files", "homepage", "repository", "bugs", "funding"])
    delete updated[key];
  fs.writeFileSync(file, JSON.stringify(updated, null, 2));
}

export function cleanUp(projectPath: string): void {
  const targets = [".git", ".github", "bin", "renovate.json", "tsconfig.cli.json"];
  for (const item of targets) {
    const p = path.join(projectPath, item);
    if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true });
  }
}

export async function main(): Promise<void> {
  const name = process.argv[2];
  if (!name) {
    console.error("Please provide a project name.");
    process.exit(1);
  }
  const projectPath = path.join(process.cwd(), name);
  const repo = "https://github.com/SamNewhouse/create-nttb";
  step("Checking Node version");
  checkNodeVersion();
  doneStep();
  step("Checking Git");
  checkGitInstalled();
  doneStep();
  step("Creating project");
  createProjectDirectory(projectPath);
  doneStep();
  step("Cloning template");
  runCommand("git", ["clone", "--depth", "1", repo, projectPath]);
  doneStep();
  process.chdir(projectPath);
  step("Installing packages");
  runCommand("npm", ["install", "--silent"]);
  doneStep();
  step("Cleaning up");
  cleanUp(projectPath);
  doneStep();
  if (fs.existsSync(path.join(projectPath, "package.json"))) {
    updatePackageJson(projectPath, name);
  }
  clearLine();
  console.log(`\nInstallation complete\n\n Next steps:\n\n cd ${name}\n npm run dev\n`);
}

export default {
  checkNodeVersion,
  checkGitInstalled,
  createProjectDirectory,
  runCommand,
  updatePackageJson,
  cleanUp,
  main,
};

if (require.main === module) {
  main().catch((err) => {
    clearLine();
    console.error("Error:", err.message);
    process.exit(1);
  });
}
