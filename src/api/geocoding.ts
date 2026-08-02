import type { City } from "../types/City";
import { GEO_URL, LANG } from "../utils/constants";

type GeoResult = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1: string;
};

export async function geocodeCity(name: string): Promise<City[]> {
  const url = `${GEO_URL}?name=${encodeURIComponent(name)}&count=5&language=${LANG}&format=json`;
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