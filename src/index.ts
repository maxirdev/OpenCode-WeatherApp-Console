import type { Config } from "./types/Config";
import type { Command } from "./types/MenuOption";
import { loadCities } from "./storage/citiesStorage";
import { loadSettings } from "./storage/settingsStorage";
import { renderMenu, readMenuOption } from "./presentation/menu";
import { cyan, bold, err } from "./utils/colors";
import { cmdWeatherDefault, cmdWeatherAll } from "./actions/getWeather";
import { cmdDailyDefault } from "./actions/getDailyForecast";
import { cmdAddCity } from "./actions/addCity";
import { cmdRemoveCity } from "./actions/removeCity";
import { cmdSetDefault } from "./actions/setDefaultCity";
import { cmdToggleSettings } from "./actions/toggleSettings";

function loadConfig(): Config {
  const settings = loadSettings();
  return {
    defaultCity: settings.defaultCity,
    cities: loadCities(),
    units: settings.units,
  };
}

const commands: Command[] = [
  { id: "1", label: () => "Clima de ciudad default", run: cmdWeatherDefault },
  {
    id: "2",
    label: (c) => `Clima de todas las ciudades (${c.cities.length})`,
    run: cmdWeatherAll,
  },
  { id: "3", label: () => "Buscar y agregar ciudad", run: cmdAddCity },
  { id: "4", label: () => "Eliminar ciudad", run: cmdRemoveCity },
  { id: "5", label: () => "Establecer ciudad default", run: cmdSetDefault },
  { id: "6", label: () => "Pronóstico 7 días (default)", run: cmdDailyDefault },
  {
    id: "8",
    label: (c) => `Ajustes (${c.units === "c" ? "°C" : "°F"})`,
    run: cmdToggleSettings,
  },
  { id: "9", label: () => "Salir", run: () => "" },
];

const VALID = new Set(commands.map((c) => c.id));

async function main(): Promise<void> {
  const config = loadConfig();
  let lastMessage: string | undefined;
  while (true) {
    renderMenu(config, commands, lastMessage);
    const opt = readMenuOption();
    if (opt === null) break;
    if (!VALID.has(opt)) {
      lastMessage = err("Opción inválida. Usa 1-6, 8 o 9.");
      continue;
    }
    if (opt === "9") break;
    const cmd = commands.find((c) => c.id === opt);
    if (!cmd) break;
    try {
      lastMessage = await cmd.run(config);
    } catch (e) {
      lastMessage = err(`Error inesperado: ${(e as Error).message}`);
    }
  }
  console.log(cyan(bold("¡Hasta luego!")));
}

await main();