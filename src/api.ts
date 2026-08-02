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

export async function geocodeCity(name: string): Promise<City | null> {
  const url = `${GEO_URL}?name=${encodeURIComponent(name)}&count=1&language=es&format=json`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = (await res.json()) as { results?: GeoResult[] };
  const first = data.results?.[0];
  if (!first) return null;
  return {
    id: first.id,
    name: first.name,
    latitude: first.latitude,
    longitude: first.longitude,
    country: first.country,
    admin1: first.admin1,
  };
}

export type Forecast = {
  temperature: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  tempUnit: string;
  windUnit: string;
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
    temperature_unit: tempUnit,
    wind_speed_unit: windUnit,
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
  };
  return {
    temperature: data.current.temperature_2m,
    humidity: data.current.relative_humidity_2m,
    windSpeed: data.current.wind_speed_10m,
    weatherCode: data.current.weather_code,
    tempUnit: data.current_units.temperature_2m,
    windUnit: data.current_units.wind_speed_10m,
  };
}