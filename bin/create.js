#!/usr/bin/env node

const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

if (process.argv.length < 3) {
  console.log("Please provide a name for your application.");
  console.log("For example: npx create-nttb my-app");
  process.exit(1);
}

const projectName = process.argv[2];
const currentPath = process.cwd();
const projectPath = path.join(currentPath, projectName);
const gitRepo = "https://github.com/SamNewhouse/create-nttb";

try {
  fs.mkdirSync(projectPath);
} catch (err) {
  if (err.code === "EEXIST") {
    console.log(
      `The file ${projectName} already exists in the current directory. Please give it another name.`
    );
  } else {
    console.log(err);
  }
  process.exit(1);
}

async function main() {
  try {
    console.log("Downloading files...");
    await cloneRepository(gitRepo, projectPath);

    process.chdir(projectPath);

    console.log("Removing unnecessary files");
    if (fs.existsSync("./.git")) {
      console.log("Cleaning out unnecessary .git directory...");
      execSync("npx rimraf ./.git");
    }

    if (fs.existsSync("./.github")) {
      console.log("Cleaning out unnecessary .github directory...");
      execSync("npx rimraf ./.github");
    }

    if (fs.existsSync("package.json")) {
      console.log("Updating package.json file");
      execSync("cp -f ./bin/package.json .")
    }

    if (fs.existsSync("./bin")) {
      console.log("Removing bin directory...");
      execSync("npx rimraf ./bin");
    }

    if (fs.existsSync("renovate.json")) {
      console.log("Removeing renovate.json...");
      execSync("rm -f renovate.json")
    }

    console.log("Installing dependencies...");
    execSync("npm install");

    console.log("Installed create-nttb successfully. Enjoy!");
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

function cloneRepository(repo, destination) {
  return new Promise((resolve, reject) => {
    try {
      execSync(`git clone --depth 1 ${repo} ${destination}`);
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

main();
