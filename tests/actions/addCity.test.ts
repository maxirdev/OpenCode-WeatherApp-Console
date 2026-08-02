import { describe, it, expect, mock, beforeEach, afterEach } from "bun:test";
import { mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { cmdAddCity, pickCity } from "../../src/actions/addCity";
import type { Config } from "../../src/types/Config";
import type { City } from "../../src/types/City";
import { loadCities } from "../../src/storage/citiesStorage";

const TMP = join(tmpdir(), `weather-cli-add-${Math.random().toString(36).slice(2)}`);

const madrid: City = {
  id: 1,
  name: "Madrid",
  latitude: 40.4,
  longitude: -3.7,
  country: "España",
  admin1: "Madrid",
};
const madridUs: City = {
  id: 2,
  name: "Madrid",
  latitude: 40.0,
  longitude: -3.5,
  country: "Estados Unidos",
  admin1: "Iowa",
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

function cfg(cities: City[] = [], defaultCity: City | null = null): Config {
  return { defaultCity, cities, units: "c" };
}

describe("cmdAddCity", () => {
  it("agrega cuando hay un único resultado", async () => {
    queue(["Madrid"]);
    globalThis.fetch = mock((_u: string) =>
      Promise.resolve(geoResponse([madrid])),
    ) as unknown as typeof fetch;
    const config = cfg();
    const msg = await cmdAddCity(config);
    expect(msg).toContain("Madrid");
    expect(msg).toContain("agregada");
    expect(config.cities.length).toBe(1);
    expect(loadCities()).toEqual([madrid]);    
  });

  it("selecciona entre múltiples coincidencias", async () => {
    queue(["Madrid", "1"]);
    globalThis.fetch = mock((_u: string) =>
      Promise.resolve(geoResponse([madrid, madridUs])),
    ) as unknown as typeof fetch;
    const config = cfg();
    const msg = await cmdAddCity(config);
    expect(msg).toContain("agregada");
    expect(config.cities.length).toBe(1);
    expect(config.cities[0]?.admin1).toBe("Madrid");
  });

  it("nombre vacío cancela", async () => {
    queue([""]);
    const fetchSpy = mock((_u: string) => Promise.resolve(geoResponse([])));
    globalThis.fetch = fetchSpy as unknown as typeof fetch;
    const config = cfg();
    const msg = await cmdAddCity(config);
    expect(msg).toContain("cancelada");
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("sin coincidencias lo indica", async () => {
    queue(["X"]);
    globalThis.fetch = mock((_u: string) =>
      Promise.resolve(geoResponse([])),
    ) as unknown as typeof fetch;
    const msg = await cmdAddCity(cfg());
    expect(msg).toContain("No se encontró");
  });

  it("duplicado por id avisa", async () => {
    queue(["Madrid"]);
    globalThis.fetch = mock((_u: string) =>
      Promise.resolve(geoResponse([madrid])),
    ) as unknown as typeof fetch;
    const msg = await cmdAddCity(cfg([madrid]));
    expect(msg).toContain("ya está en la lista");
  });

  it("ya es ciudad default avisa", async () => {
    queue(["Madrid"]);
    globalThis.fetch = mock((_u: string) =>
      Promise.resolve(geoResponse([madrid])),
    ) as unknown as typeof fetch;
    const msg = await cmdAddCity(cfg([], madrid));
    expect(msg).toContain("ya es la ciudad default");
  });

  it("error de red lo reporta", async () => {
    queue(["Madrid"]);
    globalThis.fetch = mock((_u: string) =>
      Promise.resolve(new Response("err", { status: 500 })),
    ) as unknown as typeof fetch;
    const msg = await cmdAddCity(cfg());
    expect(msg).toContain("Error de red");
  });
});

describe("pickCity", () => {
  it("selección cancelada cuando se pulsa Enter", async () => {
    queue([""]);
    globalThis.fetch = mock((_u: string) =>
      Promise.resolve(geoResponse([madrid, madridUs])),
    ) as unknown as typeof fetch;
    const { city, message } = await pickCity("Madrid");
    expect(city).toBeNull();
    expect(message).toContain("cancelada");
  });
});