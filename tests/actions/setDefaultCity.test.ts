import { describe, it, expect, mock, beforeEach, afterEach } from "bun:test";
import { mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { cmdSetDefault } from "../../src/actions/setDefaultCity";
import type { Config } from "../../src/types/Config";
import type { City } from "../../src/types/City";
import { loadSettings } from "../../src/storage/settingsStorage";
import { loadCities } from "../../src/storage/citiesStorage";

const TMP = join(tmpdir(), `weather-cli-sd-${Math.random().toString(36).slice(2)}`);

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
const originalPrompt = globalThis.prompt;
const originalLog = console.log;

function queue(values: (string | null)[]): void {
  const q = [...values];
  globalThis.prompt = mock(() => q.shift() ?? null) as unknown as typeof prompt;
}

function geoResponse(results: City[] | null): Response {
  return new Response(JSON.stringify({ results }), { status: 200 });
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
  queue([]);
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
  globalThis.prompt = originalPrompt;
  console.log = originalLog;
});

describe("cmdSetDefault", () => {
  it("establece la ciudad default, persiste y la quita de la lista", async () => {
    queue(["Madrid"]);
    globalThis.fetch = mock((_u: string) =>
      Promise.resolve(geoResponse([madrid])),
    ) as unknown as typeof fetch;
    const config: Config = {
      defaultCity: null,
      cities: [madrid],
      units: "c",
    };
    const msg = await cmdSetDefault(config);
    expect(msg).toContain("Ciudad default");
    expect(msg).toContain("Madrid");
    expect(config.defaultCity).toEqual(madrid);
    expect(config.cities.length).toBe(0);
    expect(loadSettings().defaultCity).toEqual(madrid);
    expect(loadCities()).toEqual([]);
  });

  it("nombre vacío cancela", async () => {
    queue([""]);
    const fetchSpy = mock((_u: string) => Promise.resolve(geoResponse([])));
    globalThis.fetch = fetchSpy as unknown as typeof fetch;
    const config: Config = { defaultCity: null, cities: [], units: "c" };
    const msg = await cmdSetDefault(config);
    expect(msg).toContain("cancelada");
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("sin coincidencias lo indica y no cambia el default", async () => {
    queue(["X"]);
    globalThis.fetch = mock((_u: string) =>
      Promise.resolve(geoResponse([])),
    ) as unknown as typeof fetch;
    const config: Config = { defaultCity: null, cities: [], units: "c" };
    const msg = await cmdSetDefault(config);
    expect(msg).toContain("No se encontró");
    expect(config.defaultCity).toBeNull();
  });
});