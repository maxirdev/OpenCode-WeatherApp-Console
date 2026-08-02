import type { Config } from "../types/Config";
import type { City } from "../types/City";
import type { Units } from "../types/Units";
import type { Forecast } from "../types/Weather";
import { getForecast } from "../api/weather";
import { weatherBlock } from "../presentation/display";
import { withSpinner } from "../presentation/spinner";
import { err } from "../utils/colors";

export async function weatherFor(city: City, units: Units): Promise<string> {
  try {
    const f: Forecast = await withSpinner(`Clima de ${city.name}…`, () =>
      getForecast(city.latitude, city.longitude, units),
    );
    return weatherBlock(city, f);
  } catch (e) {
    return err(`No se pudo obtener el clima de ${city.name}: ${(e as Error).message}`);
  }
}

export async function cmdWeatherDefault(config: Config): Promise<string> {
  if (!config.defaultCity) {
    return err("No hay ciudad default. Usa la opción 5 para establecerla.");
  }
  return weatherFor(config.defaultCity, config.units);
}

export async function cmdWeatherAll(config: Config): Promise<string> {
  if (config.cities.length === 0) return err("No hay ciudades guardadas.");
  const blocks: string[] = [];
  for (const c of config.cities) blocks.push(await weatherFor(c, config.units));
  return blocks.join("\n");
}