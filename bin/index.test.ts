jest.mock("./install", () => ({
  main: jest.fn(),
}));

jest.mock("./update", () => ({
  main: jest.fn(),
}));

import { main } from "./index";
import { main as installMain } from "./install";
import { main as updateMain } from "./update";

describe("create-nttb CLI routing", () => {
  const originalArgv = process.argv;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    process.argv = [...originalArgv];
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    jest.clearAllMocks();
  });

  afterEach(() => {
    process.argv = [...originalArgv];
    consoleErrorSpy.mockRestore();
  });

  test("calls install command", async () => {
    process.argv = ["node", "index.js", "install"];

    await main();

    expect(installMain).toHaveBeenCalledWith();
    expect(updateMain).not.toHaveBeenCalled();
  });

  test("calls update command", async () => {
    process.argv = ["node", "index.js", "update"];

    await main();

    expect(updateMain).toHaveBeenCalledWith(undefined);
    expect(installMain).not.toHaveBeenCalled();
  });

  test("calls update command with target path", async () => {
    process.argv = ["node", "index.js", "update", "../my-app"];

    await main();

    expect(updateMain).toHaveBeenCalledWith("../my-app");
    expect(installMain).not.toHaveBeenCalled();
  });

  test("treats other arg as project name", async () => {
    process.argv = ["node", "index.js", "my-app"];

    await main();

    expect(installMain).toHaveBeenCalledWith("my-app");
    expect(updateMain).not.toHaveBeenCalled();
  });
});
