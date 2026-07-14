import fs from "fs";
import path from "path";
import os from "os";
import { main } from "./update";

jest.mock("child_process", () => ({
  spawnSync: jest.fn(),
}));

const child = require("child_process");

function makeTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "create-nttb-update-"));
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
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
    consoleLogSpy.mockRestore();
    jest.restoreAllMocks();
  });

  test("throws when package.json is missing", async () => {
    await expect(main()).rejects.toThrow(/No package\.json found/);
  });

  test("throws when createNttbVersion is missing", async () => {
    fs.writeFileSync(
      path.join(tempDir, "package.json"),
      JSON.stringify({ name: "test-app" }),
    );

    await expect(main()).rejects.toThrow(/create-nttb project/);
  });

  test("runs update and install in current directory", async () => {
    fs.writeFileSync(
      path.join(tempDir, "package.json"),
      JSON.stringify({
        name: "test-app",
        createNttbVersion: "1.0.0",
      }),
    );

    await main();

    expect(child.spawnSync).toHaveBeenCalledWith(
      "npx",
      ["npm-check-updates", "-u"],
      expect.objectContaining({ cwd: tempDir, stdio: "inherit" }),
    );

    expect(child.spawnSync).toHaveBeenCalledWith(
      "npm",
      ["install"],
      expect.objectContaining({ cwd: tempDir, stdio: "inherit" }),
    );
  });

  test("runs update in provided target directory", async () => {
    const targetDir = path.join(tempDir, "my-app");
    fs.mkdirSync(targetDir);

    fs.writeFileSync(
      path.join(targetDir, "package.json"),
      JSON.stringify({
        name: "test-app",
        createNttbVersion: "1.0.0",
      }),
    );

    await main("my-app");

    expect(child.spawnSync).toHaveBeenCalledWith(
      "npx",
      ["npm-check-updates", "-u"],
      expect.objectContaining({ cwd: targetDir, stdio: "inherit" }),
    );

    expect(child.spawnSync).toHaveBeenCalledWith(
      "npm",
      ["install"],
      expect.objectContaining({ cwd: targetDir, stdio: "inherit" }),
    );
  });

  test("runs optional scripts when present", async () => {
    fs.writeFileSync(
      path.join(tempDir, "package.json"),
      JSON.stringify({
        name: "test-app",
        createNttbVersion: "1.0.0",
        scripts: {
          lint: "eslint .",
          build: "next build",
        },
      }),
    );

    await main();

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
