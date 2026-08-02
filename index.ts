import { loadConfig, saveConfig } from "./src/config";
import type { City, Config, Units } from "./src/config";
import { geocodeCity, getForecast } from "./src/api";
import { displayWeather } from "./src/display";
import { renderMenu, readMenuOption } from "./src/menu";

const VALID_OPTIONS = new Set(["1", "2", "3", "4", "5", "8", "9"]);

async function showWeatherForCity(city: City, units: Units): Promise<void> {
  try {
    const forecast = await getForecast(city.latitude, city.longitude, units);
    displayWeather(city, forecast);
  } catch (err) {
    console.log(
      `No se pudo obtener el clima de ${city.name}: ${(err as Error).message}`,
    );
    console.log("");
  }
}

function regionOf(c: City): string {
  return [c.admin1, c.country].filter(Boolean).join(", ");
}

async function addCity(config: Config): Promise<void> {
  const name = prompt("Nombre de la ciudad: ");
  if (!name) return;
  const city = await geocodeCity(name);
  if (!city) {
    console.log(`No se encontró la ciudad "${name}".`);
    console.log("");
    return;
  }
  if (config.cities.some((c) => c.id === city.id)) {
    console.log(`"${city.name}" ya está en la lista.`);
    console.log("");
    return;
  }
  if (config.defaultCity?.id === city.id) {
    console.log(`"${city.name}" ya es la ciudad default.`);
    console.log("");
    return;
  }
  config.cities.push(city);
  saveConfig(config);
  console.log(`"${city.name}" agregada.`);
  console.log("");
}

async function removeCity(config: Config): Promise<void> {
  if (config.cities.length === 0) {
    console.log("No hay ciudades guardadas.");
    console.log("");
    return;
  }
  console.log("Ciudades guardadas:");
  config.cities.forEach((c, i) => {
    const region = regionOf(c);
    console.log(`  ${i + 1}. ${c.name}${region ? " — " + region : ""}`);
  });
  const input = prompt("Número de la ciudad a eliminar: ");
  const idx = input ? Number.parseInt(input, 10) - 1 : NaN;
  if (Number.isNaN(idx) || idx < 0 || idx >= config.cities.length) {
    console.log("Opción inválida.");
    console.log("");
    return;
  }
  const removed = config.cities.splice(idx, 1)[0];
  if (!removed) return;
  saveConfig(config);
  console.log(`"${removed.name}" eliminada.`);
  console.log("");
}

async function setDefaultCity(config: Config): Promise<void> {
  const name = prompt("Nombre de la ciudad default: ");
  if (!name) return;
  const city = await geocodeCity(name);
  if (!city) {
    console.log(`No se encontró la ciudad "${name}".`);
    console.log("");
    return;
  }
  config.cities = config.cities.filter((c) => c.id !== city.id);
  config.defaultCity = city;
  saveConfig(config);
  console.log(`Ciudad default: ${city.name}.`);
  console.log("");
}

function toggleSettings(config: Config): void {
  config.units = config.units === "c" ? "f" : "c";
  saveConfig(config);
  console.log(`Unidad: ${config.units === "c" ? "°C" : "°F"}`);
  console.log("");
}

async function main(): Promise<void> {
  const config = loadConfig();
  while (true) {
    renderMenu(config);
    const opt = readMenuOption();
    if (opt === null) break;
    if (!VALID_OPTIONS.has(opt)) {
      console.log("Opción inválida. Usa 1-5, 8 o 9.");
      prompt("(Enter para continuar)");
      continue;
    }
    console.log("");
    if (opt === "9") break;
    if (opt === "1") {
      if (!config.defaultCity) {
        console.log("No hay ciudad default. Usa la opción 5 para establecerla.");
        console.log("");
      } else {
        await showWeatherForCity(config.defaultCity, config.units);
      }
    } else if (opt === "2") {
      if (config.cities.length === 0) {
        console.log("No hay ciudades guardadas.");
        console.log("");
      } else {
        for (const city of config.cities) {
          await showWeatherForCity(city, config.units);
        }
      }
    } else if (opt === "3") {
      await addCity(config);
    } else if (opt === "4") {
      await removeCity(config);
    } else if (opt === "5") {
      await setDefaultCity(config);
    } else if (opt === "8") {
      toggleSettings(config);
    }
    prompt("(Enter para continuar)");
  }
  console.log("¡Hasta luego!");
}

await main();