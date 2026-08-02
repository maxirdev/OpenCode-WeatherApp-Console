import type { Config } from "../types/Config";
import { promptText } from "../presentation/input";
import { saveCities } from "../storage/citiesStorage";
import { setDefaultCity } from "../storage/settingsStorage";
import { ok, err } from "../utils/colors";
import { pickCity } from "./addCity";

export async function cmdSetDefault(config: Config): Promise<string> {
  const name = promptText("Nombre de la ciudad default: ");
  if (!name) return err("Operación cancelada.");
  const { city, message } = await pickCity(name);
  if (message) return message;
  if (!city) return err("No se seleccionó ninguna ciudad.");
  config.cities = config.cities.filter((c) => c.id !== city.id);
  saveCities(config.cities);
  config.defaultCity = city;
  setDefaultCity(city);
  return ok(`Ciudad default: ${city.name}.`);
}