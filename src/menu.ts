import type { Config } from "./config";
import { cyan, bold, dim } from "./colors";

export type Command = {
  id: string;
  label: (config: Config) => string;
  run: (config: Config) => Promise<string> | string;
};

const SEP = "=".repeat(39);

export function renderMenu(
  config: Config,
  commands: Command[],
  lastMessage?: string,
): void {
  console.clear();
  if (lastMessage) {
    console.log(lastMessage.trimEnd());
    console.log(dim(SEP));
  }
  console.log(cyan(bold("         WEATHER CLI")));
  console.log(cyan(SEP));
  for (const cmd of commands) {
    console.log(`  ${cyan(cmd.id)}. ${cmd.label(config)}`);
  }
  console.log(cyan(SEP));
  if (config.defaultCity) {
    console.log(`  Default: ${dim(config.defaultCity.name)}`);
    console.log(cyan(SEP));
  }
}

export function readMenuOption(): string | null {
  return prompt("  Selecciona una opción: ");
}