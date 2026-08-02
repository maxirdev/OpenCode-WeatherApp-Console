import { loadConfig, saveConfig } from "./src/config";
import type { City, Config, Units } from "./src/config";
import { geocodeCity, getForecast } from "./src/api";
import { weatherBlock, dailyBlock } from "./src/display";
import { renderMenu, readMenuOption } from "./src/menu";
import type { Command } from "./src/menu";
import { withSpinner } from "./src/spinner";
import { ok, err, cyan, bold } from "./src/colors";

function regionOf(c: City): string {
  return [c.admin1, c.country].filter(Boolean).join(", ");
}

async function pickCity(
  config: Config,
  name: string,
): Promise<{ city: City | null; message: string }> {
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
  results.forEach((c, i) => {
    const region = regionOf(c);
    console.log(`  ${i + 1}. ${c.name}${region ? " — " + region : ""}`);
  });
  const input = prompt("Elige el número (Enter para cancelar): ");
  const idx = input ? Number.parseInt(input, 10) - 1 : NaN;
  if (Number.isNaN(idx) || idx < 0 || idx >= results.length) {
    return { city: null, message: err("Selección cancelada.") };
  }
  const city = results[idx];
  return city ? { city, message: "" } : { city: null, message: "" };
}

async function weatherFor(city: City, units: Units): Promise<string> {
  try {
    const f = await withSpinner(`Clima de ${city.name}…`, () =>
      getForecast(city.latitude, city.longitude, units),
    );
    return weatherBlock(city, f);
  } catch (e) {
    return err(`No se pudo obtener el clima de ${city.name}: ${(e as Error).message}`);
  }
}

async function dailyFor(city: City, units: Units): Promise<string> {
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

async function cmdWeatherDefault(config: Config): Promise<string> {
  if (!config.defaultCity) {
    return err("No hay ciudad default. Usa la opción 5 para establecerla.");
  }
  return weatherFor(config.defaultCity, config.units);
}

async function cmdWeatherAll(config: Config): Promise<string> {
  if (config.cities.length === 0) return err("No hay ciudades guardadas.");
  const blocks: string[] = [];
  for (const c of config.cities) blocks.push(await weatherFor(c, config.units));
  return blocks.join("\n");
}

async function cmdAddCity(config: Config): Promise<string> {
  const name = prompt("Nombre de la ciudad: ");
  if (!name) return err("Operación cancelada.");
  const { city, message } = await pickCity(config, name);
  if (message) return message;
  if (!city) return err("No se seleccionó ninguna ciudad.");
  if (config.cities.some((c) => c.id === city.id)) {
    return err(`"${city.name}" ya está en la lista.`);
  }
  if (config.defaultCity?.id === city.id) {
    return err(`"${city.name}" ya es la ciudad default.`);
  }
  config.cities.push(city);
  saveConfig(config);
  return ok(`"${city.name}" agregada.`);
}

async function cmdRemoveCity(config: Config): Promise<string> {
  if (config.cities.length === 0) return err("No hay ciudades guardadas.");
  console.log("Ciudades guardadas:");
  config.cities.forEach((c, i) => {
    const region = regionOf(c);
    console.log(`  ${i + 1}. ${c.name}${region ? " — " + region : ""}`);
  });
  const input = prompt("Número de la ciudad a eliminar: ");
  const idx = input ? Number.parseInt(input, 10) - 1 : NaN;
  if (Number.isNaN(idx) || idx < 0 || idx >= config.cities.length) {
    return err("Opción inválida.");
  }
  const removed = config.cities.splice(idx, 1)[0];
  if (!removed) return err("No se pudo eliminar.");
  saveConfig(config);
  return ok(`"${removed.name}" eliminada.`);
}

async function cmdSetDefault(config: Config): Promise<string> {
  const name = prompt("Nombre de la ciudad default: ");
  if (!name) return err("Operación cancelada.");
  const { city, message } = await pickCity(config, name);
  if (message) return message;
  if (!city) return err("No se seleccionó ninguna ciudad.");
  config.cities = config.cities.filter((c) => c.id !== city.id);
  config.defaultCity = city;
  saveConfig(config);
  return ok(`Ciudad default: ${city.name}.`);
}

async function cmdDailyDefault(config: Config): Promise<string> {
  if (!config.defaultCity) {
    return err("No hay ciudad default. Usa la opción 5 para establecerla.");
  }
  return dailyFor(config.defaultCity, config.units);
}

function cmdToggleSettings(config: Config): string {
  config.units = config.units === "c" ? "f" : "c";
  saveConfig(config);
  return ok(`Unidad: ${config.units === "c" ? "°C" : "°F"}`);
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