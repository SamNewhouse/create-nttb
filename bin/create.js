#!/usr/bin/env node

const { execSync, spawnSync } = require("child_process");
const path = require("path");
const fs = require("fs");

function checkNodeVersion(minMajor = 20) {
  const [major] = process.version.replace("v", "").split(".");
  if (Number(major) < minMajor) {
    throw new Error(`Node.js v${minMajor}+ required`);
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
    if (fs.readdirSync(projectPath).length === 0) return;
    throw new Error(`Directory "${projectPath}" exists and is not empty.`);
  }
  fs.mkdirSync(projectPath, { recursive: true });
}

function runCommand(command, args = [], options = {}) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    ...options,
  });

  if (result.error) {
    throw new Error(`Error running command "${command}": ${result.error.message}`);
  }

  if (result.status !== 0) {
    const stderr = result.stderr ? String(result.stderr) : "";
    if (stderr) {
      throw new Error(stderr);
    }
    throw new Error(`exit code ${result.status}`);
  }
}

function updatePackageJson(projectPath, projectName) {
  const file = path.join(projectPath, "package.json");

  let pkg;
  try {
    pkg = JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (err) {
    throw new Error(`Failed to read or parse package.json: ${err.message}`);
  }

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
  };

  for (const key of ["author", "bin", "files", "homepage", "repository", "bugs", "funding"]) {
    delete updated[key];
  }

  fs.writeFileSync(file, JSON.stringify(updated, null, 2));
}

function cleanUp(projectPath) {
  const targets = [".git", ".github", "bin", "renovate.json"];

  for (const item of targets) {
    const targetPath = path.join(projectPath, item);
    if (!fs.existsSync(targetPath)) continue;

    try {
      fs.rmSync(targetPath, { recursive: true, force: true });
    } catch (err) {
      throw new Error(`Failed to remove ${item}: ${err.message}`);
    }
  }
}

module.exports = {
  checkNodeVersion,
  checkGitInstalled,
  createProjectDirectory,
  runCommand,
  updatePackageJson,
  cleanUp,
};
