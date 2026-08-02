import { describe, it, expect, mock, beforeEach, afterEach } from "bun:test";
import { mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { cmdDailyDefault, dailyFor } from "../../src/actions/getDailyForecast";
import type { Config } from "../../src/types/Config";
import type { City } from "../../src/types/City";

const TMP = join(tmpdir(), `weather-cli-df-${Math.random().toString(36).slice(2)}`);

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
    Promise.resolve(
      new Response(
        JSON.stringify({
          current_units: { temperature_2m: "°C", wind_speed_10m: "km/h" },
          current: {
            temperature_2m: 21.3,
            relative_humidity_2m: 50,
            wind_speed_10m: 10,
            weather_code: 2,
          },
          daily: {
            time: ["2026-08-01", "2026-08-02", "2026-08-03"],
            weather_code: [0, 3, 61],
            temperature_2m_max: [25, 22, 20],
            temperature_2m_min: [15, 12, 10],
            precipitation_sum: [0, 1.2, 0.5],
          },
        }),
        { status: 200 },
      ),
    ),
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

describe("cmdDailyDefault", () => {
  it("sin ciudad default devuelve error", async () => {
    const config: Config = { defaultCity: null, cities: [], units: "c" };
    const msg = await cmdDailyDefault(config);
    expect(msg).toContain("No hay ciudad default");
  });

  it("con ciudad default devuelve el bloque 7 días", async () => {
    const config: Config = { defaultCity: madrid, cities: [], units: "c" };
    const msg = await cmdDailyDefault(config);
    expect(msg).toContain("Madrid");
    expect(msg).toContain("7 días");
    expect(msg).toContain("Despejado");
    expect(msg).toContain("Nublado");
    expect(msg).toContain("1.2 mm");
  });
});

describe("dailyFor", () => {
  it("API en error devuelve mensaje de fallo", async () => {
    globalThis.fetch = mock((_url: string) =>
      Promise.resolve(new Response("err", { status: 500 })),
    ) as unknown as typeof fetch;
    const msg = await dailyFor(madrid, "c");
    expect(msg).toContain("No se pudo obtener el pronóstico");
    expect(msg).toContain("500");
  });
});