import type { City, Units } from "./config";

const GEO_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

type GeoResult = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1: string;
};

export async function geocodeCity(name: string): Promise<City[]> {
  const url = `${GEO_URL}?name=${encodeURIComponent(name)}&count=5&language=es&format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Geocoding API error: ${res.status}`);
  const data = (await res.json()) as { results?: GeoResult[] };
  const results = data.results ?? [];
  return results.map((r) => ({
    id: r.id,
    name: r.name,
    latitude: r.latitude,
    longitude: r.longitude,
    country: r.country,
    admin1: r.admin1,
  }));
}

export type DailyEntry = {
  date: string;
  tMax: number;
  tMin: number;
  code: number;
  precip: number;
};

export type Forecast = {
  temperature: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  tempUnit: string;
  windUnit: string;
  daily: DailyEntry[];
};

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