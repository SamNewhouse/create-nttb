const fs = require("fs");
const path = require("path");
const os = require("os");

jest.mock("child_process", () => ({
  execSync: jest.fn(),
  execFileSync: jest.fn(),
  spawnSync: jest.fn(),
}));

const child = require("child_process");

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
function readPkg(dir) {
  return JSON.parse(fs.readFileSync(path.join(dir, "package.json"), "utf8"));
}

describe("create-nttb helpers", () => {
  let tempDir;
  let projectDir;
  const name = "jest-app";

  beforeEach(() => {
    tempDir = makeTempDir();
    projectDir = path.join(tempDir, name);
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  describe("checkNodeVersion", () => {
    test("throws for low version", () => {
      const original = process.version;
      Object.defineProperty(process, "version", { value: "v10.0.0" });
      expect(() => checkNodeVersion(20)).toThrow(/Node\.js v20\+ required/);
      Object.defineProperty(process, "version", { value: original });
    });

    test("passes for high version", () => {
      expect(() => checkNodeVersion(10)).not.toThrow();
    });

    test("handles exact required version", () => {
      const original = process.version;
      Object.defineProperty(process, "version", { value: "v20.0.0" });
      expect(() => checkNodeVersion(20)).not.toThrow();
      Object.defineProperty(process, "version", { value: original });
    });
  });

  describe("checkGitInstalled", () => {
    test("passes when git is present", () => {
      child.execSync.mockImplementation(() => {});
      expect(() => checkGitInstalled()).not.toThrow();
    });

    test("throws when git missing", () => {
      child.execSync.mockImplementation(() => {
        throw new Error("git missing");
      });
      expect(() => checkGitInstalled()).toThrow(/Git is not installed/);
    });

    test("throws on exec failure", () => {
      child.execSync.mockImplementation(() => {
        throw new Error("fail");
      });
      expect(() => checkGitInstalled()).toThrow();
    });
  });

  describe("createProjectDirectory", () => {
    test("creates empty directory", () => {
      expect(fs.existsSync(projectDir)).toBe(false);
      createProjectDirectory(projectDir);
      expect(fs.existsSync(projectDir)).toBe(true);
    });

    test("allows re-run on empty directory", () => {
      createProjectDirectory(projectDir);
      expect(() => createProjectDirectory(projectDir)).not.toThrow();
    });

    test("throws if not empty", () => {
      createProjectDirectory(projectDir);
      fs.writeFileSync(path.join(projectDir, "file.txt"), "x");
      expect(() => createProjectDirectory(projectDir)).toThrow(/not empty/);
    });

    test("throws if path is a file", () => {
      fs.writeFileSync(projectDir, "x");
      expect(() => createProjectDirectory(projectDir)).toThrow();
    });

    test("creates nested directories", () => {
      const nested = path.join(tempDir, "a/b/c");
      createProjectDirectory(nested);
      expect(fs.existsSync(nested)).toBe(true);
    });
  });

  describe("runCommand", () => {
    afterEach(() => child.spawnSync.mockReset());

    test("throws on spawn error", () => {
      child.spawnSync.mockImplementation(() => ({ error: new Error("bad cmd") }));
      expect(() => runCommand("bad")).toThrow(/Error running command/);
    });

    test("throws on nonzero exit code", () => {
      child.spawnSync.mockReturnValue({ status: 2 });
      expect(() => runCommand("fail")).toThrow(/exit code 2/);
    });

    test("passes on zero exit code", () => {
      child.spawnSync.mockReturnValue({ status: 0 });
      expect(() => runCommand("ok")).not.toThrow();
    });

    test("passes stderr through", () => {
      child.spawnSync.mockReturnValue({ status: 3, stderr: "err" });
      expect(() => runCommand("cmd")).toThrow(/err/);
    });
  });

  describe("updatePackageJson", () => {
    test("updates fields", () => {
      fs.mkdirSync(projectDir);

      const pkg = {
        name: "starter",
        version: "0.1.0",
        author: "a",
        bin: {},
        homepage: "h",
        repository: "r",
        bugs: {},
        files: [],
        funding: {},
        keywords: [],
      };

      fs.writeFileSync(path.join(projectDir, "package.json"), JSON.stringify(pkg));
      updatePackageJson(projectDir, name);

      const updated = readPkg(projectDir);

      expect(updated.name).toBe(name);
      expect(updated.version).toBe("1.0.0");
      expect(updated.description).toBe(`${name} app description`);
      expect(updated.keywords).toHaveLength(7);

      ["author", "bin", "homepage", "files", "repository", "bugs", "funding"].forEach((k) =>
        expect(updated[k]).toBeUndefined(),
      );
    });

    test("throws on invalid json", () => {
      fs.mkdirSync(projectDir);
      fs.writeFileSync(path.join(projectDir, "package.json"), "{bad:");
      expect(() => updatePackageJson(projectDir, name)).toThrow(/Failed to read or parse/);
    });

    test("keeps unknown fields", () => {
      fs.mkdirSync(projectDir);
      fs.writeFileSync(
        path.join(projectDir, "package.json"),
        JSON.stringify({ name: "x", custom: 123 }),
      );

      updatePackageJson(projectDir, name);
      const updated = readPkg(projectDir);

      expect(updated.custom).toBe(123);
    });
  });

  describe("cleanUp", () => {
    test("removes boilerplate files", () => {
      fs.mkdirSync(projectDir);
      const cwd = process.cwd();
      process.chdir(projectDir);

      [".git", ".github", "bin"].forEach((d) => fs.mkdirSync(d));
      fs.writeFileSync("renovate.json", "{}");

      child.execFileSync.mockImplementation(() => {
        throw new Error("no rimraf");
      });

      cleanUp(projectDir);

      [".git", ".github", "bin", "renovate.json"].forEach((d) =>
        expect(fs.existsSync(d)).toBe(false),
      );

      process.chdir(cwd);
    });

    test("quietly skips missing files", () => {
      fs.mkdirSync(projectDir);
      child.execFileSync.mockImplementation(() => {
        throw new Error("skip");
      });

      expect(() => cleanUp(projectDir)).not.toThrow();
    });

    test("uses rimraf when available", () => {
      fs.mkdirSync(projectDir);
      fs.mkdirSync(path.join(projectDir, ".git"));

      child.execFileSync.mockImplementation(() => {});

      cleanUp(projectDir);

      expect(fs.existsSync(path.join(projectDir, ".git"))).toBe(false);
    });
  });
});
