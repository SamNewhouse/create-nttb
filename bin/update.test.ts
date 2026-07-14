import fs from "fs";
import path from "path";
import os from "os";
import * as updateModule from "./update";

jest.mock("child_process", () => ({
  spawnSync: jest.fn(),
}));

const child = require("child_process");

function makeTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "create-nttb-update-"));
}

function writeJson(filePath: string, data: Record<string, any>) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function readJson(filePath: string): Record<string, any> {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

describe("update command", () => {
  let tempDir: string;
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    tempDir = makeTempDir();
    jest.spyOn(process, "cwd").mockReturnValue(tempDir);
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    child.spawnSync.mockReset();
    child.spawnSync.mockReturnValue({ status: 0 });

    jest.spyOn(updateModule, "getTemplatePackageJson").mockReturnValue({
      name: "my-app",
      version: "1.0.0",
      private: true,
      createNttbVersion: "0.0.0",
      scripts: {
        dev: "next dev",
        build: "next build",
        start: "next start",
        format: "prettier --write .",
        "type-check": "tsc --noEmit",
      },
      dependencies: {
        next: "16.2.10",
        react: "19.2.7",
        "react-dom": "19.2.7",
      },
      devDependencies: {
        "@tailwindcss/postcss": "4.3.2",
        "@types/node": "26.1.1",
        "@types/react": "19.2.17",
        "@types/react-dom": "19.2.3",
        prettier: "3.9.5",
        tailwindcss: "4.3.2",
        typescript: "6.0.3",
      },
      engines: {
        node: ">=20.0.0",
        npm: ">=10.0.0",
      },
    });
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
    consoleLogSpy.mockRestore();
    jest.restoreAllMocks();
  });

  test("throws when package.json is missing", async () => {
    await expect(updateModule.main()).rejects.toThrow(/No package\.json found/);
  });

  test("throws when createNttbVersion is missing", async () => {
    writeJson(path.join(tempDir, "package.json"), {
      name: "test-app",
    });

    await expect(updateModule.main()).rejects.toThrow(/create-nttb project/);
  });

  test("updates package.json from template and installs in current directory", async () => {
    writeJson(path.join(tempDir, "package.json"), {
      name: "portfolio",
      version: "1.7.3",
      description: "Sam Newhouse Portfolio",
      createNttbVersion: "4.9.0",
      scripts: {
        dev: "next dev",
        build: "next build",
        start: "next start",
      },
      dependencies: {
        "@vercel/analytics": "2.0.1",
        next: "16.2.7",
        react: "19.2.7",
        "react-dom": "19.2.7",
      },
      devDependencies: {
        "@tailwindcss/postcss": "4.3.0",
        "@types/node": "^24",
        "@types/react": "19.2.16",
        "@types/react-dom": "19.2.3",
        tailwindcss: "4.3.0",
        typescript: "5.9.3",
      },
      author: "Sam Newhouse",
    });

    await updateModule.main();

    const updated = readJson(path.join(tempDir, "package.json"));

    expect(updated.name).toBe("portfolio");
    expect(updated.description).toBe("Sam Newhouse Portfolio");
    expect(updated.author).toBe("Sam Newhouse");
    expect(updated.createNttbVersion).toBe(updateModule.getCreateNttbVersion());

    expect(updated.dependencies).toEqual({
      "@vercel/analytics": "2.0.1",
      next: "16.2.10",
      react: "19.2.7",
      "react-dom": "19.2.7",
    });

    expect(updated.devDependencies).toEqual({
      "@tailwindcss/postcss": "4.3.2",
      "@types/node": "26.1.1",
      "@types/react": "19.2.17",
      "@types/react-dom": "19.2.3",
      prettier: "3.9.5",
      tailwindcss: "4.3.2",
      typescript: "6.0.3",
    });

    expect(updated.engines).toEqual({
      node: ">=20.0.0",
      npm: ">=10.0.0",
    });

    expect(child.spawnSync).toHaveBeenCalledWith(
      "npm",
      ["install"],
      expect.objectContaining({ cwd: tempDir, stdio: "inherit" }),
    );

    expect(child.spawnSync).toHaveBeenCalledWith(
      "npm",
      ["run", "build"],
      expect.objectContaining({ cwd: tempDir, stdio: "inherit" }),
    );
  });

  test("updates package.json in provided target directory", async () => {
    const targetDir = path.join(tempDir, "my-app");
    fs.mkdirSync(targetDir);

    writeJson(path.join(targetDir, "package.json"), {
      name: "test-app",
      createNttbVersion: "1.0.0",
      dependencies: {
        next: "16.2.7",
      },
      devDependencies: {
        typescript: "5.9.3",
      },
    });

    await updateModule.main("my-app");

    const updated = readJson(path.join(targetDir, "package.json"));

    expect(updated.createNttbVersion).toBe(updateModule.getCreateNttbVersion());
    expect(updated.dependencies.next).toBe("16.2.10");
    expect(updated.devDependencies.typescript).toBe("6.0.3");

    expect(child.spawnSync).toHaveBeenCalledWith(
      "npm",
      ["install"],
      expect.objectContaining({ cwd: targetDir, stdio: "inherit" }),
    );
  });

  test("runs optional scripts when present after template merge", async () => {
    writeJson(path.join(tempDir, "package.json"), {
      name: "test-app",
      createNttbVersion: "1.0.0",
      scripts: {
        lint: "eslint .",
      },
    });

    await updateModule.main();

    expect(child.spawnSync).toHaveBeenCalledWith(
      "npm",
      ["run", "lint"],
      expect.objectContaining({ cwd: tempDir, stdio: "inherit" }),
    );

    expect(child.spawnSync).toHaveBeenCalledWith(
      "npm",
      ["run", "build"],
      expect.objectContaining({ cwd: tempDir, stdio: "inherit" }),
    );
  });
});
