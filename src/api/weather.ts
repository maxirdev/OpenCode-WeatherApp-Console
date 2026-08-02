import type { Units } from "../types/Units";
import type { Forecast, DailyEntry } from "../types/Weather";
import { FORECAST_URL } from "../utils/constants";

export async function getForecast(
  lat: number,
  lon: number,
  units: Units,
): Promise<Forecast> {
  const tempUnit = units === "c" ? "celsius" : "fahrenheit";
  const windUnit = units === "c" ? "kmh" : "mph";
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current: "temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code",
    daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum",
    temperature_unit: tempUnit,
    wind_speed_unit: windUnit,
    forecast_days: "7",
    timezone: "auto",
  });
  const res = await fetch(`${FORECAST_URL}?${params}`);
  if (!res.ok) throw new Error(`Forecast API error: ${res.status}`);
  const data = (await res.json()) as {
    current_units: { temperature_2m: string; wind_speed_10m: string };
    current: {
      temperature_2m: number;
      relative_humidity_2m: number;
      wind_speed_10m: number;
      weather_code: number;
    };
    daily: {
      time: string[];
      weather_code: number[];
      temperature_2m_max: number[];
      temperature_2m_min: number[];
      precipitation_sum: number[];
    };
  };
  const d = data.daily;
  const daily: DailyEntry[] = d.time.map((date, i) => ({
    date,
    tMax: d.temperature_2m_max[i] ?? 0,
    tMin: d.temperature_2m_min[i] ?? 0,
    code: d.weather_code[i] ?? 0,
    precip: d.precipitation_sum[i] ?? 0,
  }));
  return {
    temperature: data.current.temperature_2m,
    humidity: data.current.relative_humidity_2m,
    windSpeed: data.current.wind_speed_10m,
    weatherCode: data.current.weather_code,
    tempUnit: data.current_units.temperature_2m,
    windUnit: data.current_units.wind_speed_10m,
    daily,
  };
}