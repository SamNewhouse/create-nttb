const fs = require("fs");
const path = require("path");
const os = require("os");
const { spawnSync } = require("child_process");

const CLI_PATH = path.join(__dirname, "create.js");
const PROJECT_NAME = "jest-app";

function makeTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "create-nttb-"));
}
function projectPath(tempDir) {
  return path.join(tempDir, PROJECT_NAME);
}

describe("create-nttb CLI", () => {
  let tempDir;
  beforeEach(() => {
    tempDir = makeTempDir();
    process.chdir(tempDir);
  });

  afterEach(() => {
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {}
  });

  test("fails when no project name passed", () => {
    const res = spawnSync("node", [CLI_PATH], { encoding: "utf8" });
    expect(res.status).not.toBe(0);
    expect((res.stdout || "") + (res.stderr || "")).toMatch(/provide a name/i);
  });

  test("fails if dir exists and is not empty", () => {
    fs.mkdirSync(PROJECT_NAME);
    fs.writeFileSync(path.join(projectPath(tempDir), "x.txt"), "dummy");
    const res = spawnSync("node", [CLI_PATH, PROJECT_NAME], { encoding: "utf8" });
    expect(res.status).not.toBe(0);
    expect((res.stdout || "") + (res.stderr || "")).toMatch(/already exists and is not empty/i);
  });

  test("creates dir if it does not exist", () => {
    const res = spawnSync("node", [CLI_PATH, PROJECT_NAME], { encoding: "utf8" });
    expect(res.status).toBe(0);
    expect(fs.existsSync(projectPath(tempDir))).toBe(true);
  });

  test("succeeds if dir exists but is empty", () => {
    fs.mkdirSync(PROJECT_NAME);
    const res = spawnSync("node", [CLI_PATH, PROJECT_NAME], { encoding: "utf8" });
    expect(res.status).toBe(0);
    expect(fs.existsSync(projectPath(tempDir))).toBe(true);
  });

  test("exits if git is missing", () => {
    const res = spawnSync("node", [CLI_PATH, PROJECT_NAME], {
      env: { ...process.env, PATH: "" },
      encoding: "utf8",
    });
    expect(res.status).not.toBe(0);
    // Can't guarantee output; checking exit code is sufficient.
  });

  test("handles failed git clone", () => {
    const cloneScript = path.join(tempDir, "create_fail_git.js");
    const scriptContents = fs
      .readFileSync(CLI_PATH, "utf8")
      .replace(
        "https://github.com/SamNewhouse/create-nttb",
        "https://invalid.invalid/does-not-exist",
      );
    fs.writeFileSync(cloneScript, scriptContents);
    const res = spawnSync("node", [cloneScript, PROJECT_NAME], { encoding: "utf8" });
    expect(res.status).not.toBe(0);
    expect((res.stdout || "") + (res.stderr || "")).toMatch(/command "git/i);
  });

  test("handles failed npm install", () => {
    const npmFailScript = path.join(tempDir, "create_fail_npm.js");
    const scriptContents = fs
      .readFileSync(CLI_PATH, "utf8")
      .replace(
        'runCommand("npm", ["install"]);',
        'runCommand("npm", ["install", "does-not-exist-package-zzz"]);',
      );
    fs.writeFileSync(npmFailScript, scriptContents);
    const res = spawnSync("node", [npmFailScript, PROJECT_NAME], { encoding: "utf8" });
    expect(res.status).not.toBe(0);
    expect((res.stdout || "") + (res.stderr || "")).toMatch(/command "npm/i);
  });

  test.only("updatePackageJson throws on corrupt package.json as helper", () => {
    fs.mkdirSync(PROJECT_NAME);
    fs.writeFileSync(path.join(projectPath(tempDir), "package.json"), "{foo:");
    process.chdir(projectPath(tempDir));
    const { updatePackageJson } = require("./create.js");
    expect(() => updatePackageJson()).toThrow(/Unexpected token/);
  });

  test("updates package.json properly", () => {
    fs.mkdirSync(PROJECT_NAME);
    const pkg = {
      name: "boilerplate",
      version: "0.9.0",
      author: "Boiler",
      bin: {},
      homepage: "test.com",
      repository: {},
      bugs: {},
      files: ["lib"],
      funding: {},
      keywords: [],
    };
    fs.writeFileSync(path.join(projectPath(tempDir), "package.json"), JSON.stringify(pkg));
    process.chdir(projectPath(tempDir));
    const { updatePackageJson } = require("./create.js");
    updatePackageJson();
    const updated = JSON.parse(fs.readFileSync("package.json", "utf8"));
    expect(updated.name).toBe(PROJECT_NAME);
    expect(updated.version).toBe("1.0.0");
    expect(updated.keywords).toContain(PROJECT_NAME);
    expect(updated.author).toBeUndefined();
    expect(updated.bin).toBeUndefined();
    expect(updated.funding).toBeUndefined();
  });

  test("handles rimraf/fs.rmSync cleanup errors", () => {
    fs.mkdirSync(PROJECT_NAME);
    process.chdir(projectPath(tempDir));
    fs.mkdirSync(".github", { recursive: true });
    fs.chmodSync(".github", 0o000);
    const { cleanUp } = require("./create.js");
    // If an exception is thrown, that's correct
    try {
      cleanUp();
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
      fs.chmodSync(".github", 0o755);
      return;
    }
    // If no error was thrown, reset perms so test dir can be cleaned up
    fs.chmodSync(".github", 0o755);
    throw new Error("No error thrown on dir permissions failure for cleanup");
  });

  test("cleanUp removes all boilerplate files", () => {
    fs.mkdirSync(PROJECT_NAME);
    process.chdir(projectPath(tempDir));
    [".git", ".github", "bin"].forEach((f) => fs.mkdirSync(f, { recursive: true }));
    fs.writeFileSync("renovate.json", "{}");
    const { cleanUp } = require("./create.js");
    cleanUp();
    [".git", ".github", "bin", "renovate.json"].forEach((f) => {
      expect(fs.existsSync(f)).toBe(false);
    });
  });

  test("shows next steps instructions on success", () => {
    const res = spawnSync("node", [CLI_PATH, PROJECT_NAME], { encoding: "utf8" });
    expect((res.stdout || "") + (res.stderr || "")).toMatch(/next steps/i);
    expect((res.stdout || "") + (res.stderr || "")).toMatch(new RegExp(`cd ${PROJECT_NAME}`));
  });
});
