import type { Config } from "../types/Config";
import { promptIndex } from "../presentation/input";
import { listCities } from "./listCities";
import { removeCityByIndex } from "../storage/citiesStorage";
import { ok, err } from "../utils/colors";

export function cmdRemoveCity(config: Config): string {
  if (config.cities.length === 0) return err("No hay ciudades guardadas.");
  console.log(listCities(config.cities));
  const { idx, cancelled } = promptIndex(
    "Número de la ciudad a eliminar: ",
    config.cities.length,
  );
  if (cancelled) return err("Operación cancelada.");
  if (idx < 0 || idx >= config.cities.length) return err("Opción inválida.");
  const { cities, removed } = removeCityByIndex(config.cities, idx);
  if (!removed) return err("No se pudo eliminar.");
  config.cities = cities;
  return ok(`"${removed.name}" eliminada.`);
}