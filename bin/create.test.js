const fs = require("fs");
const path = require("path");
const os = require("os");

jest.mock("./create.js", () => {
  const actual = jest.requireActual("./create.js");
  return {
    ...actual,
    main: jest.fn(),
  };
});

const {
  checkNodeVersion,
  checkGitInstalled,
  createProjectDirectory,
  runCommand,
  updatePackageJson,
  cleanUp,
} = require("./create.js");

jest.mock("child_process", () => ({
  execSync: jest.fn(),
  execFileSync: jest.fn(),
  spawnSync: jest.fn(),
}));

const child = require("child_process");

beforeAll(() => {
  jest.spyOn(console, "log").mockImplementation(() => {});
});

afterAll(() => {
  console.log.mockRestore();
});

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
  });

  describe("checkGitInstalled", () => {
    test("passes when git present", () => {
      child.execSync.mockImplementation(() => {});
      expect(() => checkGitInstalled()).not.toThrow();
    });

    test("throws when git missing", () => {
      child.execSync.mockImplementation(() => {
        throw new Error("missing");
      });
      expect(() => checkGitInstalled()).toThrow(/Git is not installed/);
    });
  });

  describe("createProjectDirectory", () => {
    test("creates directory", () => {
      expect(fs.existsSync(projectDir)).toBe(false);
      createProjectDirectory(projectDir);
      expect(fs.existsSync(projectDir)).toBe(true);
    });

    test("allows empty dir rerun", () => {
      createProjectDirectory(projectDir);
      expect(() => createProjectDirectory(projectDir)).not.toThrow();
    });

    test("throws if not empty", () => {
      createProjectDirectory(projectDir);
      fs.writeFileSync(path.join(projectDir, "x"), "x");
      expect(() => createProjectDirectory(projectDir)).toThrow(/not empty/);
    });
  });

  describe("runCommand", () => {
    afterEach(() => child.spawnSync.mockReset());

    test("throws on spawn error", () => {
      child.spawnSync.mockReturnValue({ error: new Error("bad") });
      expect(() => runCommand("bad")).toThrow(/bad/);
    });

    test("throws on nonzero exit", () => {
      child.spawnSync.mockReturnValue({ status: 2 });
      expect(() => runCommand("fail")).toThrow(/failed/);
    });

    test("passes on success", () => {
      child.spawnSync.mockReturnValue({ status: 0 });
      expect(() => runCommand("ok")).not.toThrow();
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

      ["author", "bin", "files", "homepage", "repository", "bugs", "funding"].forEach((k) =>
        expect(updated[k]).toBeUndefined(),
      );
    });
  });

  describe("cleanUp", () => {
    test("removes boilerplate files", () => {
      fs.mkdirSync(projectDir);

      [".git", ".github", "bin"].forEach((d) => fs.mkdirSync(path.join(projectDir, d)));
      fs.writeFileSync(path.join(projectDir, "renovate.json"), "{}");

      cleanUp(projectDir);

      [".git", ".github", "bin", "renovate.json"].forEach((d) =>
        expect(fs.existsSync(path.join(projectDir, d))).toBe(false),
      );
    });

    test("skips missing files silently", () => {
      fs.mkdirSync(projectDir);
      expect(() => cleanUp(projectDir)).not.toThrow();
    });
  });
});
