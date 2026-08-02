import type { City } from "./config";
import type { Forecast } from "./api";
import { weatherDescription } from "./weather_codes";

export function displayWeather(city: City, f: Forecast): void {
  const region = [city.admin1, city.country].filter(Boolean).join(", ");
  console.log(`--- ${city.name}${region ? ", " + region : ""} ---`);
  console.log(`Cielo: ${weatherDescription(f.weatherCode)}`);
  console.log(`Temperatura: ${f.temperature} ${f.tempUnit}`);
  console.log(`Humedad: ${f.humidity} %`);
  console.log(`Viento: ${f.windSpeed} ${f.windUnit}`);
  console.log("");
}