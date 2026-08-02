import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

export type City = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1: string;
};

export type Units = "c" | "f";

export type Config = {
  defaultCity: City | null;
  cities: City[];
  units: Units;
};

function configDir(): string {
  if (process.platform === "win32") {
    const appdata = process.env.APPDATA;
    if (appdata) return join(appdata, "weather-cli");
  }
  const xdg = process.env.XDG_CONFIG_HOME;
  if (xdg) return join(xdg, "weather-cli");
  return join(homedir(), ".config", "weather-cli");
}

function configPath(): string {
  return join(configDir(), "config.json");
}

export function defaultConfig(): Config {
  return { defaultCity: null, cities: [], units: "c" };
}

export function loadConfig(): Config {
  const path = configPath();
  if (!existsSync(path)) return defaultConfig();
  try {
    const raw = readFileSync(path, "utf8");
    const parsed = JSON.parse(raw) as Partial<Config>;
    return {
      defaultCity: parsed.defaultCity ?? null,
      cities: Array.isArray(parsed.cities) ? parsed.cities : [],
      units: parsed.units === "f" ? "f" : "c",
    };
  } catch {
    return defaultConfig();
  }
}

export function saveConfig(config: Config): void {
  const dir = configDir();
  mkdirSync(dir, { recursive: true });
  writeFileSync(configPath(), JSON.stringify(config, null, 2), "utf8");
}