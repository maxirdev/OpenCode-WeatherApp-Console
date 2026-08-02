import { describe, it, expect, mock, beforeEach, afterEach } from "bun:test";
import { mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { cmdWeatherDefault, cmdWeatherAll, weatherFor } from "../../src/actions/getWeather";
import type { Config } from "../../src/types/Config";
import type { City } from "../../src/types/City";

const TMP = join(tmpdir(), `weather-cli-gw-${Math.random().toString(36).slice(2)}`);

const madrid: City = {
  id: 1,
  name: "Madrid",
  latitude: 40.4,
  longitude: -3.7,
  country: "España",
  admin1: "Madrid",
};

let savedAppdata: string | undefined;
let savedXdg: string | undefined;
let savedCi: string | undefined;
const originalFetch = globalThis.fetch;
const originalLog = console.log;

function forecastResponse(): Response {
  return new Response(
    JSON.stringify({
      current_units: { temperature_2m: "°C", wind_speed_10m: "km/h" },
      current: {
        temperature_2m: 21.3,
        relative_humidity_2m: 50,
        wind_speed_10m: 10,
        weather_code: 2,
      },
      daily: {
        time: ["2026-08-01"],
        weather_code: [0],
        temperature_2m_max: [25],
        temperature_2m_min: [15],
        precipitation_sum: [0],
      },
    }),
    { status: 200 },
  );
}

beforeEach(() => {
  mkdirSync(TMP, { recursive: true });
  savedAppdata = process.env.APPDATA;
  savedXdg = process.env.XDG_CONFIG_HOME;
  savedCi = process.env.CI;
  process.env.APPDATA = TMP;
  process.env.XDG_CONFIG_HOME = TMP;
  process.env.CI = "1";
  console.log = mock(() => {});
  globalThis.fetch = mock((_url: string) =>
    Promise.resolve(forecastResponse()),
  ) as unknown as typeof fetch;
});

afterEach(() => {
  rmSync(TMP, { recursive: true, force: true });
  if (savedAppdata === undefined) delete process.env.APPDATA;
  else process.env.APPDATA = savedAppdata;
  if (savedXdg === undefined) delete process.env.XDG_CONFIG_HOME;
  else process.env.XDG_CONFIG_HOME = savedXdg;
  if (savedCi === undefined) delete process.env.CI;
  else process.env.CI = savedCi;
  globalThis.fetch = originalFetch;
  console.log = originalLog;
});

describe("cmdWeatherDefault", () => {
  it("sin ciudad default devuelve error", async () => {
    const config: Config = { defaultCity: null, cities: [], units: "c" };
    const msg = await cmdWeatherDefault(config);
    expect(msg).toContain("No hay ciudad default");
  });

  it("con ciudad default devuelve el bloque de clima", async () => {
    const config: Config = { defaultCity: madrid, cities: [], units: "c" };
    const msg = await cmdWeatherDefault(config);
    expect(msg).toContain("Madrid");
    expect(msg).toContain("Parcialmente nublado");
    expect(msg).toContain("21.3");
  });
});

describe("cmdWeatherAll", () => {
  it("sin ciudades devuelve error", async () => {
    const config: Config = { defaultCity: null, cities: [], units: "c" };
    const msg = await cmdWeatherAll(config);
    expect(msg).toContain("No hay ciudades guardadas");
  });

  it("con ciudades devuelve un bloque por ciudad", async () => {
    const config: Config = {
      defaultCity: null,
      cities: [madrid, { ...madrid, id: 2, name: "Barcelona" }],
      units: "c",
    };
    const msg = await cmdWeatherAll(config);
    expect(msg).toContain("Madrid");
    expect(msg).toContain("Barcelona");
  });
});

describe("weatherFor", () => {
  it("API en error devuelve mensaje de fallo", async () => {
    globalThis.fetch = mock((_url: string) =>
      Promise.resolve(new Response("err", { status: 500 })),
    ) as unknown as typeof fetch;
    const msg = await weatherFor(madrid, "c");
    expect(msg).toContain("No se pudo obtener el clima");
    expect(msg).toContain("500");
  });
});