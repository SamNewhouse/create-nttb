#!/usr/bin/env node

/**
 * create-nttb CLI installer
 *
 * Usage: npx create-nttb <project-name>
 *
 * - Clones the boilerplate repo
 * - Installs dependencies
 * - Cleans boilerplate artifacts
 * - Sets up your app with a unique name and version
 */

const { execSync, execFileSync, spawnSync } = require("child_process");
const path = require("path");
const fs = require("fs");

// Check Node.js version (minimum v16)
function checkNodeVersion(minMajor = 16) {
  const [major] = process.version.replace("v", "").split(".");
  if (Number(major) < minMajor) {
    console.error(`❌ Node.js v${minMajor} or later is required. You are using v${process.version}`);
    process.exit(1);
  }
}

// Check if Git is installed
function checkGit() {
  try {
    execSync("git --version", { stdio: "ignore" });
  } catch {
    console.error("❌ Git is not installed. Please install Git first: https://git-scm.com/");
    process.exit(1);
  }
}

checkNodeVersion();
checkGit();

if (process.argv.length < 3) {
  console.error("\nPlease provide a name for your application.");
  console.error("For example: npx create-nttb my-app\n");
  process.exit(1);
}

const projectName = process.argv[2];
const currentPath = process.cwd();
const projectPath = path.join(currentPath, projectName);
const gitRepo = "https://github.com/SamNewhouse/create-nttb";

/**
 * Creates the project directory.
 * Fails if the directory exists and is not empty.
 */
function createProjectDirectory() {
  if (fs.existsSync(projectPath)) {
    if (fs.readdirSync(projectPath).length === 0) {
      // Directory exists but is empty; allow it
      return;
    }
    console.error(`The directory "${projectName}" already exists and is not empty. Please choose another name or remove the directory.`);
    process.exit(1);
  }
  fs.mkdirSync(projectPath);
}

/**
 * Runs a shell command, throws on errors.
 * @param {string} command
 * @param {string[]} args
 * @param {object} options
 */
function runCommand(command, args = [], options = {}) {
  const result = spawnSync(command, args, { stdio: "inherit", ...options });
  if (result.error) {
    console.error(`Error running command "${command} ${args.join(" ")}": ${result.error.message}`);
    process.exit(1);
  }
  if (result.status !== 0) {
    console.error(`Command "${command} ${args.join(" ")}" failed with exit code ${result.status}`);
    process.exit(1);
  }
}

/**
 * Updates package.json with project-specific info.
 * Removes bin/author from boilerplate.
 */
function updatePackageJson() {
  const packageJsonPath = path.join(projectPath, "package.json");
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

  const updatedPackageJson = {
    ...packageJson,
    name: projectName,
    version: "1.0.0",
    description: `${projectName} app description`,
  };
  delete updatedPackageJson.author;
  delete updatedPackageJson.bin;

  fs.writeFileSync(packageJsonPath, JSON.stringify(updatedPackageJson, null, 2));
}

/**
 * Removes boilerplate files/directories after cloning for a clean start.
 * Tries to use rimraf; falls back to fs.rmSync if available (Node 14+).
 */
function cleanUp() {
  const pathsToRemove = [".git", ".github", "bin", "renovate.json"];

  console.log("Cleaning up project...");
  pathsToRemove.forEach((item) => {
    const itemPath = path.join(projectPath, item);
    if (fs.existsSync(itemPath)) {
      console.log(`Removing ${itemPath}...`);
      try {
        // Use rimraf for cross-platform safety
        execFileSync("npx", ["rimraf", itemPath], { stdio: "inherit", cwd: projectPath });
      } catch (err) {
        // Try Node's rmSync if rimraf fails
        try {
          fs.rmSync(itemPath, { recursive: true, force: true });
        } catch {
          console.error(`Failed to remove ${itemPath}: ${err.message}`);
          process.exit(1);
        }
      }
    }
  });
}

/**
 * Main installer workflow. Clones, installs, cleans, updates, and finishes.
 */
async function main() {
  createProjectDirectory();

  console.log("Cloning repository...");
  runCommand("git", ["clone", "--depth", "1", gitRepo, projectPath]);

  process.chdir(projectPath);

  console.log("Installing dependencies...");
  runCommand("npm", ["install"]);

  cleanUp();

  if (fs.existsSync("package.json")) {
    console.log("Updating package.json...");
    updatePackageJson();
  }

  // Helpful success message and next steps for user
  console.log("\n✅ Installed create-nttb successfully!\n");
  console.log(`Next steps:
  cd ${projectName}
  npm run dev
  `);
  console.log("Enjoy building with your new Next.js + Tailwind + TypeScript boilerplate!\n");
}

// Catch and display all errors with full stack/message for easier debugging
main().catch((error) => {
  console.error("An unexpected error occurred:", error);
  process.exit(1);
});
