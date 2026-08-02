import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import type { City } from "../types/City";
import type { Units } from "../types/Units";
import { appDir, appFile } from "../utils/paths";

const FILE = "settings.json";

type Settings = {
  units: Units;
  defaultCity: City | null;
};

export function defaultSettings(): Settings {
  return { units: "c", defaultCity: null };
}

export function loadSettings(): Settings {
  const path = appFile(FILE);
  if (!existsSync(path)) return defaultSettings();
  try {
    const raw = readFileSync(path, "utf8");
    const parsed = JSON.parse(raw) as Partial<Settings>;
    return {
      units: parsed.units === "f" ? "f" : "c",
      defaultCity: parsed.defaultCity ?? null,
    };
  } catch {
    return defaultSettings();
  }
}

export function saveSettings(settings: Settings): void {
  mkdirSync(appDir(), { recursive: true });
  writeFileSync(appFile(FILE), JSON.stringify(settings, null, 2), "utf8");
}

export function setUnits(units: Units): Settings {
  const next = { ...loadSettings(), units };
  saveSettings(next);
  return next;
}

export function setDefaultCity(city: City | null): Settings {
  const next = { ...loadSettings(), defaultCity: city };
  saveSettings(next);
  return next;
}