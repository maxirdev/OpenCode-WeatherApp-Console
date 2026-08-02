import type { City } from "../types/City";

export function regionOf(c: City): string {
  return [c.admin1, c.country].filter(Boolean).join(", ");
}

export function fmtDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("es", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  });
}