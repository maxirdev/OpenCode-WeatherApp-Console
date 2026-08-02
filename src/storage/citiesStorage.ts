import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import type { City } from "../types/City";
import { appDir, appFile } from "../utils/paths";

const FILE = "cities.json";

export function loadCities(): City[] {
  const path = appFile(FILE);
  if (!existsSync(path)) return [];
  try {
    const raw = readFileSync(path, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as City[]) : [];
  } catch {
    return [];
  }
}

export function saveCities(cities: City[]): void {
  mkdirSync(appDir(), { recursive: true });
  writeFileSync(appFile(FILE), JSON.stringify(cities, null, 2), "utf8");
}

export function hasCity(cities: City[], id: number): boolean {
  return cities.some((c) => c.id === id);
}

export function addCity(cities: City[], city: City): City[] {
  if (hasCity(cities, city.id)) return cities;
  const next = [...cities, city];
  saveCities(next);
  return next;
}

export function removeCityByIndex(cities: City[], idx: number): {
  cities: City[];
  removed: City | null;
} {
  if (idx < 0 || idx >= cities.length) return { cities, removed: null };
  const removed = cities[idx] ?? null;
  const next = cities.filter((_, i) => i !== idx);
  saveCities(next);
  return { cities: next, removed };
}