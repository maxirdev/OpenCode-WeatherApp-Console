import type { City } from "./config";
import type { Forecast } from "./api";
import { weatherDescription } from "./weather_codes";
import { cyan, yellow, dim, bold, blue, temp, muted } from "./colors";

function regionOf(c: City): string {
  return [c.admin1, c.country].filter(Boolean).join(", ");
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("es", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  });
}

export function weatherBlock(city: City, f: Forecast): string {
  const region = regionOf(city);
  const header = cyan(
    bold(`--- ${city.name}${region ? ", " + region : ""} ---`),
  );
  const lines = [
    `Cielo:        ${weatherDescription(f.weatherCode)}`,
    `Temperatura:  ${temp(`${f.temperature} ${f.tempUnit}`)}`,
    `Humedad:      ${dim(`${f.humidity} %`)}`,
    `Viento:       ${dim(`${f.windSpeed} ${f.windUnit}`)}`,
  ];
  return [header, ...lines, ""].join("\n");
}

export function dailyBlock(city: City, f: Forecast): string {
  const region = regionOf(city);
  const header = cyan(
    bold(`--- ${city.name}${region ? ", " + region : ""} (7 días) ---`),
  );
  const rows = f.daily.map((d) => {
    const day = fmtDate(d.date).padEnd(12);
    const t = `${yellow(String(d.tMax))}/${blue(String(d.tMin))}`;
    const sky = weatherDescription(d.code).padEnd(26);
    const precip = muted(`💧 ${d.precip} mm`);
    return `  ${day} ${t.padEnd(12)} ${sky} ${precip}`;
  });
  const legend = dim(
    `${f.tempUnit.split(" ")[0] ?? ""} (máx/mín)`,
  );
  return [header, ...rows, legend, ""].join("\n");
}