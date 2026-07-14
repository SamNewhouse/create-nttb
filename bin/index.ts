#!/usr/bin/env node
import { main as installMain } from "./install";
import { main as updateMain } from "./update";

function showHelp(): void {
  console.log(`
Usage:
  create-nttb <project-name>
  create-nttb install
  create-nttb update [project-path]
`);
}

export async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const [command, targetPath] = args;

  if (!command) {
    showHelp();
    process.exit(1);
  }

  if (command === "install") {
    await installMain();
    return;
  }

  if (command === "update") {
    await updateMain(targetPath);
    return;
  }

  await installMain(command);
}

if (require.main === module) {
  main().catch((err: Error) => {
    console.error("Error:", err.message);
    process.exit(1);
  });
}
