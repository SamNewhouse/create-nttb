#!/usr/bin/env node

const { execSync, execFileSync, spawnSync } = require("child_process");
const path = require("path");
const fs = require("fs");

function checkNodeVersion(minMajor = 20) {
  const [major] = process.version.replace("v", "").split(".");
  if (Number(major) < minMajor) {
    throw new Error(`Node.js v${minMajor}+ required, current is ${process.version}`);
  }
}

function checkGitInstalled() {
  try {
    execSync("git --version", { stdio: "ignore" });
  } catch {
    throw new Error("Git is not installed. See https://git-scm.com/");
  }
}

function createProjectDirectory(projectPath) {
  if (fs.existsSync(projectPath)) {
    if (fs.readdirSync(projectPath).length === 0) {
      return;
    }
    throw new Error(`Directory "${projectPath}" exists and is not empty.`);
  }
  fs.mkdirSync(projectPath);
}

function runCommand(command, args = [], options = {}) {
  const result = spawnSync(command, args, { stdio: "inherit", ...options });
  if (result.error) {
    throw new Error(
      `Error running command "${command} ${args.join(" ")}": ${result.error.message}`,
    );
  }
  if (result.status !== 0) {
    throw new Error(
      `Command "${command} ${args.join(" ")}" failed with exit code ${result.status}`,
    );
  }
}

function updatePackageJson(projectPath, projectName) {
  const packageJsonPath = path.join(projectPath, "package.json");
  let packageJson;
  try {
    packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
  } catch (err) {
    throw new Error(`Failed to read or parse package.json: ${err.message}`);
  }
  const updatedPackageJson = {
    ...packageJson,
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
  };
  ["author", "bin", "files", "homepage", "repository", "bugs", "funding"].forEach(
    (k) => delete updatedPackageJson[k],
  );
  fs.writeFileSync(packageJsonPath, JSON.stringify(updatedPackageJson, null, 2));
}

function cleanUp(projectPath) {
  const pathsToRemove = [".git", ".github", "bin", "renovate.json"];
  pathsToRemove.forEach((item) => {
    const itemPath = path.join(projectPath, item);
    if (fs.existsSync(itemPath)) {
      try {
        execFileSync("npx", ["rimraf", itemPath], { stdio: "inherit", cwd: projectPath });
      } catch (err) {
        try {
          fs.rmSync(itemPath, { recursive: true, force: true });
        } catch (e) {
          throw new Error(`Failed to remove ${itemPath}: ${e.message}`);
        }
      }
    }
  });
}

module.exports = {
  checkNodeVersion,
  checkGitInstalled,
  createProjectDirectory,
  runCommand,
  updatePackageJson,
  cleanUp,
};
