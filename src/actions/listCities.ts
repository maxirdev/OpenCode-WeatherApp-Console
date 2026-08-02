import type { City } from "../types/City";
import { regionOf } from "../utils/format";

export function listCities(cities: City[]): string {
  if (cities.length === 0) return "No hay ciudades guardadas.";
  const lines = cities.map((c, i) => {
    const region = regionOf(c);
    return `  ${i + 1}. ${c.name}${region ? " — " + region : ""}`;
  });
  return ["Ciudades guardadas:", ...lines].join("\n");
}