import type { Config } from "./Config";

export type Command = {
  id: string;
  label: (config: Config) => string;
  run: (config: Config) => Promise<string> | string;
};