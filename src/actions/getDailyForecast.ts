import type { Config } from "../types/Config";
import type { City } from "../types/City";
import type { Units } from "../types/Units";
import { getForecast } from "../api/weather";
import { dailyBlock } from "../presentation/display";
import { withSpinner } from "../presentation/spinner";
import { err } from "../utils/colors";

export async function dailyFor(city: City, units: Units): Promise<string> {
  try {
    const f = await withSpinner(`7 días de ${city.name}…`, () =>
      getForecast(city.latitude, city.longitude, units),
    );
    return dailyBlock(city, f);
  } catch (e) {
    return err(
      `No se pudo obtener el pronóstico de ${city.name}: ${(e as Error).message}`,
    );
  }
}

export async function cmdDailyDefault(config: Config): Promise<string> {
  if (!config.defaultCity) {
    return err("No hay ciudad default. Usa la opción 5 para establecerla.");
  }
  return dailyFor(config.defaultCity, config.units);
}