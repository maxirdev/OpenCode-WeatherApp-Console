import { describe, it, expect } from "bun:test";
import { weatherBlock, dailyBlock } from "../../src/presentation/display";
import type { City } from "../../src/types/City";
import type { Forecast } from "../../src/types/Weather";

const city: City = {
  id: 1,
  name: "Madrid",
  latitude: 40.4,
  longitude: -3.7,
  country: "España",
  admin1: "Madrid",
};

const forecast: Forecast = {
  temperature: 21.3,
  humidity: 50,
  windSpeed: 10,
  weatherCode: 2,
  tempUnit: "°C",
  windUnit: "km/h",
  daily: [
    {
      date: "2026-08-01",
      tMax: 25,
      tMin: 15,
      code: 0,
      precip: 0,
    },
    {
      date: "2026-08-02",
      tMax: 22,
      tMin: 12,
      code: 3,
      precip: 1.2,
    },
  ],
};

describe("weatherBlock", () => {
  it("incluye nombre, región y campos del clima", () => {
    const out = weatherBlock(city, forecast);
    expect(out).toContain("Madrid");
    expect(out).toContain("Madrid, España");
    expect(out).toContain("Parcialmente nublado");
    expect(out).toContain("21.3");
    expect(out).toContain("50 %");
    expect(out).toContain("10");
    expect(out).toContain("km/h");
  });
});

describe("dailyBlock", () => {
  it("incluye cabecera 7 días y cada fila", () => {
    const out = dailyBlock(city, forecast);
    expect(out).toContain("(7 días)");
    expect(out).toContain("25");
    expect(out).toContain("15");
    expect(out).toContain("22");
    expect(out).toContain("12");
    expect(out).toContain("Despejado");
    expect(out).toContain("Nublado");
    expect(out).toContain("1.2 mm");
    expect(out).toContain("máx/mín");
  });
});