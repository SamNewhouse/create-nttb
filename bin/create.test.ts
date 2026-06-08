import fs from "fs";
import path from "path";
import os from "os";

jest.mock("./create", () => {
  const actual = jest.requireActual<typeof import("./create")>("./create");
  return {
    ...actual,
    main: jest.fn(),
  };
});

import {
  validateProjectName,
  checkNodeVersion,
  checkNpmVersion,
  createProjectDirectory,
  runCommand,
  copyTemplate,
  updatePackageJson,
} from "./create";

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
  (console.log as jest.Mock).mockRestore();
});

function makeTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "create-nttb-"));
}

function readPkg(dir: string): Record<string, any> {
  return JSON.parse(fs.readFileSync(path.join(dir, "package.json"), "utf8"));
}

describe("create-nttb helpers", () => {
  let tempDir: string;
  let projectDir: string;
  const name = "jest-app";

  beforeEach(() => {
    tempDir = makeTempDir();
    projectDir = path.join(tempDir, name);
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  describe("validateProjectName", () => {
    test("passes for valid names", () => {
      expect(() => validateProjectName("my-app")).not.toThrow();
      expect(() => validateProjectName("myapp")).not.toThrow();
      expect(() => validateProjectName("my_app")).not.toThrow();
      expect(() => validateProjectName("App123")).not.toThrow();
    });

    test("throws for name with spaces", () => {
      expect(() => validateProjectName("my app")).toThrow(
        /Invalid project name/,
      );
    });

    test("throws for name with special characters", () => {
      expect(() => validateProjectName("my@app")).toThrow(
        /Invalid project name/,
      );
      expect(() => validateProjectName("../evil")).toThrow(
        /Invalid project name/,
      );
      expect(() => validateProjectName("./local")).toThrow(
        /Invalid project name/,
      );
    });

    test("throws for name starting with hyphen", () => {
      expect(() => validateProjectName("-myapp")).toThrow(
        /Invalid project name/,
      );
    });

    test("throws for name ending with hyphen", () => {
      expect(() => validateProjectName("myapp-")).toThrow(
        /Invalid project name/,
      );
    });

    test("throws for name exceeding 214 characters", () => {
      expect(() => validateProjectName("a".repeat(215))).toThrow(
        /214 characters/,
      );
    });

    test("passes for name exactly 214 characters", () => {
      expect(() => validateProjectName("a".repeat(214))).not.toThrow();
    });
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

  describe("checkNpmVersion", () => {
    afterEach(() => child.execSync.mockReset());

    test("passes for sufficient npm version", () => {
      child.execSync.mockReturnValue("10.0.0");
      expect(() => checkNpmVersion(10)).not.toThrow();
    });

    test("passes for higher npm version", () => {
      child.execSync.mockReturnValue("11.3.0");
      expect(() => checkNpmVersion(10)).not.toThrow();
    });

    test("throws for npm version too low", () => {
      child.execSync.mockReturnValue("9.8.0");
      expect(() => checkNpmVersion(10)).toThrow(/npm v10\+ required/);
    });

    test("throws when npm not accessible", () => {
      child.execSync.mockImplementation(() => {
        throw new Error("not found");
      });
      expect(() => checkNpmVersion(10)).toThrow(/npm is not installed/);
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
      child.spawnSync.mockReturnValue({ error: new Error("bad") } as any);
      expect(() => runCommand("bad")).toThrow(/bad/);
    });

    test("throws on nonzero exit", () => {
      child.spawnSync.mockReturnValue({ status: 2 } as any);
      expect(() => runCommand("fail")).toThrow(/failed/);
    });

    test("passes on success", () => {
      child.spawnSync.mockReturnValue({ status: 0 } as any);
      expect(() => runCommand("ok")).not.toThrow();
    });

    test("passes cwd option through", () => {
      child.spawnSync.mockReturnValue({ status: 0 } as any);
      runCommand("ok", [], { cwd: "/tmp" });
      expect(child.spawnSync).toHaveBeenCalledWith(
        "ok",
        [],
        expect.objectContaining({ cwd: "/tmp" }),
      );
    });

    test("passes timeout option through", () => {
      child.spawnSync.mockReturnValue({ status: 0 } as any);
      runCommand("ok", [], { timeout: 60000 });
      expect(child.spawnSync).toHaveBeenCalledWith(
        "ok",
        [],
        expect.objectContaining({ timeout: 60000 }),
      );
    });
  });

  describe("copyTemplate", () => {
    test("copies files from template to project directory", () => {
      const srcDir = path.join(tempDir, "template");
      fs.mkdirSync(srcDir);
      fs.writeFileSync(
        path.join(srcDir, "package.json"),
        JSON.stringify({ name: "template" }),
      );
      fs.mkdirSync(projectDir);

      copyTemplate(srcDir, projectDir);

      expect(fs.existsSync(path.join(projectDir, "package.json"))).toBe(true);
    });

    test("copies nested directories", () => {
      const srcDir = path.join(tempDir, "template");
      fs.mkdirSync(srcDir);
      fs.mkdirSync(path.join(srcDir, "src"));
      fs.writeFileSync(
        path.join(srcDir, "src", "index.ts"),
        "export default {};",
      );
      fs.mkdirSync(projectDir);

      copyTemplate(srcDir, projectDir);

      expect(fs.existsSync(path.join(projectDir, "src", "index.ts"))).toBe(
        true,
      );
    });
  });

  describe("updatePackageJson", () => {
    test("updates name, version, description and keywords", () => {
      fs.mkdirSync(projectDir);

      const pkg = {
        name: "template",
        version: "1.0.0",
        private: true,
        scripts: {
          dev: "next dev",
          build: "next build",
          start: "next start",
          format: "prettier --write .",
          test: "jest",
          "type-check": "tsc --noEmit",
        },
        dependencies: { next: "16.0.0" },
      };

      fs.writeFileSync(
        path.join(projectDir, "package.json"),
        JSON.stringify(pkg),
      );

      updatePackageJson(projectDir, name);

      const updated = readPkg(projectDir);

      expect(updated.name).toBe(name);
      expect(updated.version).toBe("1.0.0");
      expect(updated.description).toBe(`${name} app`);
      expect(updated.keywords).toHaveLength(7);
      expect(updated.keywords).toContain(name);
    });

    test("preserves scripts and dependencies", () => {
      fs.mkdirSync(projectDir);

      const pkg = {
        name: "template",
        version: "1.0.0",
        scripts: {
          dev: "next dev",
          build: "next build",
          start: "next start",
          format: "prettier --write .",
          test: "jest",
          "type-check": "tsc --noEmit",
        },
        dependencies: { next: "16.0.0" },
      };

      fs.writeFileSync(
        path.join(projectDir, "package.json"),
        JSON.stringify(pkg),
      );

      updatePackageJson(projectDir, name);

      const updated = readPkg(projectDir);
      expect(updated.scripts).toEqual(pkg.scripts);
      expect(updated.dependencies).toEqual({ next: "16.0.0" });
    });
  });
});
