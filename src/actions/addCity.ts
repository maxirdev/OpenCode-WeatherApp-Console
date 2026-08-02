import type { Config } from "../types/Config";
import type { City } from "../types/City";
import { geocodeCity } from "../api/geocoding";
import { promptIndex, promptText } from "../presentation/input";
import { withSpinner } from "../presentation/spinner";
import { regionOf } from "../utils/format";
import { ok, err } from "../utils/colors";
import { addCity, hasCity } from "../storage/citiesStorage";

function cityLine(c: City, i: number): string {
  const region = regionOf(c);
  return `  ${i + 1}. ${c.name}${region ? " — " + region : ""}`;
}

export async function pickCity(name: string): Promise<{ city: City | null; message: string }> {
  let results: City[];
  try {
    results = await withSpinner("Buscando…", () => geocodeCity(name));
  } catch (e) {
    return { city: null, message: err(`Error de red: ${(e as Error).message}`) };
  }
  if (results.length === 0) {
    return { city: null, message: err(`No se encontró "${name}".`) };
  }
  if (results.length === 1) {
    const city = results[0];
    return city ? { city, message: "" } : { city: null, message: "" };
  }
  console.log("Varias coincidencias:");
  results.forEach((c, i) => console.log(cityLine(c, i)));
  const { idx } = promptIndex("Elige el número (Enter para cancelar): ", results.length);
  if (idx < 0 || idx >= results.length) {
    return { city: null, message: err("Selección cancelada.") };
  }
  const city = results[idx];
  return city ? { city, message: "" } : { city: null, message: "" };
}

export async function cmdAddCity(config: Config): Promise<string> {
  const name = promptText("Nombre de la ciudad: ");
  if (!name) return err("Operación cancelada.");
  const { city, message } = await pickCity(name);
  if (message) return message;
  if (!city) return err("No se seleccionó ninguna ciudad.");
  if (hasCity(config.cities, city.id)) {
    return err(`"${city.name}" ya está en la lista.`);
  }
  if (config.defaultCity?.id === city.id) {
    return err(`"${city.name}" ya es la ciudad default.`);
  }
  config.cities = addCity(config.cities, city);
  return ok(`"${city.name}" agregada.`);
}