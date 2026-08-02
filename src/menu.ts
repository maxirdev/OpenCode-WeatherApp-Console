import type { Config } from "./config";

const SEP = "=".repeat(39);

export function renderMenu(config: Config): void {
  const unitLabel = config.units === "c" ? "°C" : "°F";
  console.clear();
  console.log(SEP);
  console.log("         WEATHER CLI");
  console.log(SEP);
  console.log("  1. Clima de ciudad default");
  console.log(`  2. Clima de todas las ciudades (${config.cities.length})`);
  console.log("  3. Buscar y agregar ciudad");
  console.log("  4. Eliminar ciudad");
  console.log("  5. Establecer ciudad default");
  console.log(`  8. Ajustes (${unitLabel})`);
  console.log("  9. Salir");
  console.log(SEP);
  if (config.defaultCity) {
    console.log(`  Default: ${config.defaultCity.name}`);
    console.log(SEP);
  }
}

export function readMenuOption(): string | null {
  return prompt("  Selecciona una opción: ");
}