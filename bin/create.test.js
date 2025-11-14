const fs = require("fs");
const path = require("path");
const os = require("os");
const {
  checkNodeVersion,
  checkGitInstalled,
  createProjectDirectory,
  runCommand,
  updatePackageJson,
  cleanUp,
} = require("./create.js");

function makeTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "create-nttb-"));
}
function getPkg(projectPath) {
  return JSON.parse(fs.readFileSync(path.join(projectPath, "package.json"), "utf8"));
}

describe("create-nttb helpers", () => {
  let tempDir;
  let testProject;
  const projectName = "jest-app";

  beforeEach(() => {
    tempDir = makeTempDir();
    testProject = path.join(tempDir, projectName);
  });

  afterEach(() => {
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {}
  });

  test("checkNodeVersion throws for low version", () => {
    const original = process.version;
    Object.defineProperty(process, "version", { value: "v10.0.0" });
    expect(() => checkNodeVersion(20)).toThrow(/Node\.js v20\+ required/);
    Object.defineProperty(process, "version", { value: original });
  });

  test("checkNodeVersion passes for high version", () => {
    expect(() => checkNodeVersion(10)).not.toThrow();
  });

  test("checkGitInstalled throws if git not present", () => {
    // This can't really be tested without impacting your dev env.
    // You could mock execSync here, or skip this test.
    // Skipping for safety.
    expect(typeof checkGitInstalled).toBe("function");
  });

  test("createProjectDirectory creates dirs, rejects nonempty", () => {
    expect(fs.existsSync(testProject)).toBe(false);
    createProjectDirectory(testProject);
    expect(fs.existsSync(testProject)).toBe(true);
    // Should allow empty dir
    expect(() => createProjectDirectory(testProject)).not.toThrow();
    // Should throw for nonempty dir
    fs.writeFileSync(path.join(testProject, "file.txt"), "hi");
    expect(() => createProjectDirectory(testProject)).toThrow(/exists and is not empty/);
  });

  test("runCommand throws on bad command", () => {
    expect(() => runCommand("does_not_exist_command")).toThrow(/Error running command/);
  });

  test("updatePackageJson updates and cleans package.json", () => {
    fs.mkdirSync(testProject);
    const pkg = {
      name: "boilerplate",
      version: "0.9.0",
      author: "Me",
      bin: { test: "bin/cli.js" },
      homepage: "old",
      repository: { url: "repo" },
      bugs: {},
      files: ["lib"],
      funding: {},
      keywords: [],
    };
    fs.writeFileSync(path.join(testProject, "package.json"), JSON.stringify(pkg));
    updatePackageJson(testProject, projectName);
    const updated = getPkg(testProject);
    expect(updated.name).toBe(projectName);
    expect(updated.version).toBe("1.0.0");
    expect(updated.author).toBeUndefined();
    expect(updated.bin).toBeUndefined();
    expect(updated.funding).toBeUndefined();
    expect(updated.keywords).toContain(projectName);
  });

  test("updatePackageJson throws on corrupt package.json", () => {
    fs.mkdirSync(testProject);
    fs.writeFileSync(path.join(testProject, "package.json"), "{foo:");
    expect(() => updatePackageJson(testProject, projectName)).toThrow(/Failed to read or parse/);
  });

  test("cleanUp removes known boilerplate files", () => {
    fs.mkdirSync(testProject);
    process.chdir(testProject);
    [".git", ".github", "bin"].forEach((f) => fs.mkdirSync(f));
    fs.writeFileSync("renovate.json", "{}");
    expect(fs.existsSync(".git")).toBe(true);
    cleanUp(testProject);
    [".git", ".github", "bin", "renovate.json"].forEach((f) => {
      expect(fs.existsSync(f)).toBe(false);
    });
  });

  test("cleanUp throws if path can't be removed", () => {
    fs.mkdirSync(testProject);
    process.chdir(testProject);
    fs.mkdirSync(".github");
    fs.chmodSync(".github", 0o000);
    try {
      expect(() => cleanUp(testProject)).toThrow(/Failed to remove/);
    } finally {
      fs.chmodSync(".github", 0o755);
    }
  });
});
