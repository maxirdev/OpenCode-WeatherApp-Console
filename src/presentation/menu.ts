import type { Config } from "../types/Config";
import type { Command } from "../types/MenuOption";
import { cyan, bold, dim } from "../utils/colors";
import { MENU_SEP } from "../utils/constants";

export function renderMenu(
  config: Config,
  commands: Command[],
  lastMessage?: string,
): void {
  console.clear();
  if (lastMessage) {
    console.log(lastMessage.trimEnd());
    console.log(dim(MENU_SEP));
  }
  console.log(cyan(bold("         WEATHER CLI")));
  console.log(cyan(MENU_SEP));
  for (const cmd of commands) {
    console.log(`  ${cyan(cmd.id)}. ${cmd.label(config)}`);
  }
  console.log(cyan(MENU_SEP));
  if (config.defaultCity) {
    console.log(`  Default: ${dim(config.defaultCity.name)}`);
    console.log(cyan(MENU_SEP));
  }
}

export function readMenuOption(): string | null {
  return prompt("  Selecciona una opción: ");
}