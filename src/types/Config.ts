import type { City } from "./City";
import type { Units } from "./Units";

export type Config = {
  defaultCity: City | null;
  cities: City[];
  units: Units;
};