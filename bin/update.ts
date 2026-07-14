import fs from "fs";
import path from "path";
import { spawnSync, SpawnSyncOptions } from "child_process";

type PackageJson = Record<string, any>;

export function runCommand(
  command: string,
  args: string[] = [],
  options: SpawnSyncOptions = {},
): void {
  const result = spawnSync(command, args, { stdio: "inherit", ...options });

  if (!result || typeof result !== "object") {
    throw new Error(`${command} failed`);
  }

  if (result.error) {
    throw new Error(result.error.message || `${command} failed`);
  }

  if (result.status !== 0) {
    throw new Error(`${command} failed`);
  }
}

export function getPackageJson(projectPath: string): PackageJson {
  const packageJsonPath = path.join(projectPath, "package.json");

  if (!fs.existsSync(packageJsonPath)) {
    throw new Error(`No package.json found in "${projectPath}".`);
  }

  return JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
}

export function getTemplatePackageJson(): PackageJson {
  const templatePackageJsonPath = path.join(
    __dirname,
    "..",
    "template",
    "package.json",
  );

  if (!fs.existsSync(templatePackageJsonPath)) {
    throw new Error("No template package.json found.");
  }

  return JSON.parse(fs.readFileSync(templatePackageJsonPath, "utf8"));
}

export function getCreateNttbVersion(): string {
  const rootPackageJsonPath = path.join(__dirname, "..", "package.json");
  const rootPkg = JSON.parse(fs.readFileSync(rootPackageJsonPath, "utf8"));

  if (!rootPkg.version) {
    throw new Error(
      "Could not determine create-nttb version from root package.json.",
    );
  }

  return rootPkg.version;
}

export function mergeDependencies(
  currentDeps: Record<string, string> = {},
  templateDeps: Record<string, string> = {},
): Record<string, string> {
  return {
    ...currentDeps,
    ...templateDeps,
  };
}

export function updatePackageJsonFromTemplate(projectPath: string): void {
  const packageJsonPath = path.join(projectPath, "package.json");
  const currentPkg = getPackageJson(projectPath);
  const templatePkg = getTemplatePackageJson();
  const createNttbVersion = getCreateNttbVersion();

  const updated: PackageJson = {
    ...currentPkg,
    private: true,
    createNttbVersion,
    scripts: {
      ...(currentPkg.scripts ?? {}),
      ...(templatePkg.scripts ?? {}),
    },
    dependencies: mergeDependencies(
      currentPkg.dependencies,
      templatePkg.dependencies,
    ),
    devDependencies: mergeDependencies(
      currentPkg.devDependencies,
      templatePkg.devDependencies,
    ),
    engines: {
      ...(currentPkg.engines ?? {}),
      ...(templatePkg.engines ?? {}),
    },
  };

  fs.writeFileSync(packageJsonPath, JSON.stringify(updated, null, 2) + "\n");
}

export async function main(targetDir?: string): Promise<void> {
  const projectPath = targetDir
    ? path.resolve(process.cwd(), targetDir)
    : process.cwd();

  const pkg = getPackageJson(projectPath);

  if (!pkg.createNttbVersion) {
    throw new Error(
      `This does not look like a create-nttb project: "${projectPath}". Missing createNttbVersion in package.json.`,
    );
  }

  console.log(`Updating package.json from template in ${projectPath}...`);
  updatePackageJsonFromTemplate(projectPath);

  console.log("Installing updated packages...");
  runCommand("npm", ["install"], { cwd: projectPath });

  const updatedPkg = getPackageJson(projectPath);
  const scripts = updatedPkg.scripts ?? {};

  if (scripts.lint) {
    console.log("Running lint...");
    runCommand("npm", ["run", "lint"], { cwd: projectPath });
  }

  if (scripts.build) {
    console.log("Running build...");
    runCommand("npm", ["run", "build"], { cwd: projectPath });
  }

  console.log("Update complete.");
}
