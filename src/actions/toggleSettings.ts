import type { Config } from "../types/Config";
import { setUnits } from "../storage/settingsStorage";
import { ok } from "../utils/colors";

export function cmdToggleSettings(config: Config): string {
  config.units = config.units === "c" ? "f" : "c";
  setUnits(config.units);
  return ok(`Unidad: ${config.units === "c" ? "°C" : "°F"}`);
}