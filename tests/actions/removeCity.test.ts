import { describe, it, expect, mock, beforeEach, afterEach } from "bun:test";
import { mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { cmdRemoveCity } from "../../src/actions/removeCity";
import type { Config } from "../../src/types/Config";
import type { City } from "../../src/types/City";
import { loadCities } from "../../src/storage/citiesStorage";

const TMP = join(tmpdir(), `weather-cli-rm-${Math.random().toString(36).slice(2)}`);

const madrid: City = {
  id: 1,
  name: "Madrid",
  latitude: 40.4,
  longitude: -3.7,
  country: "España",
  admin1: "Madrid",
};
const barcelona: City = {
  id: 2,
  name: "Barcelona",
  latitude: 41.4,
  longitude: 2.2,
  country: "España",
  admin1: "Cataluña",
};

let savedAppdata: string | undefined;
let savedXdg: string | undefined;
const originalPrompt = globalThis.prompt;
const originalLog = console.log;

beforeEach(() => {
  mkdirSync(TMP, { recursive: true });
  savedAppdata = process.env.APPDATA;
  savedXdg = process.env.XDG_CONFIG_HOME;
  process.env.APPDATA = TMP;
  process.env.XDG_CONFIG_HOME = TMP;
  console.log = mock(() => {});
});

afterEach(() => {
  rmSync(TMP, { recursive: true, force: true });
  if (savedAppdata === undefined) delete process.env.APPDATA;
  else process.env.APPDATA = savedAppdata;
  if (savedXdg === undefined) delete process.env.XDG_CONFIG_HOME;
  else process.env.XDG_CONFIG_HOME = savedXdg;
  globalThis.prompt = originalPrompt;
  console.log = originalLog;
});

function setPrompt(value: string | null): void {
  globalThis.prompt = mock(() => value) as unknown as typeof prompt;
}

describe("cmdRemoveCity", () => {
  it("lista vacía devuelve error", () => {
    const config: Config = { defaultCity: null, cities: [], units: "c" };
    const msg = cmdRemoveCity(config);
    expect(msg).toContain("No hay ciudades guardadas.");
  });

  it("elimina la ciudad seleccionada y persiste", () => {
    setPrompt("1");
    const config: Config = {
      defaultCity: null,
      cities: [madrid, barcelona],
      units: "c",
    };
    const msg = cmdRemoveCity(config);
    expect(msg).toContain("Madrid");
    expect(msg).toContain("eliminada");
    expect(config.cities.length).toBe(1);
    expect(config.cities[0]?.id).toBe(2);
    expect(loadCities()).toEqual([barcelona]);
  });

  it("entrada vacía cancela", () => {
    setPrompt("");
    const config: Config = {
      defaultCity: null,
      cities: [madrid],
      units: "c",
    };
    const msg = cmdRemoveCity(config);
    expect(msg).toContain("cancelada");
    expect(config.cities.length).toBe(1);
  });

  it("índice fuera de rango devuelve opción inválida", () => {
    setPrompt("99");
    const config: Config = {
      defaultCity: null,
      cities: [madrid],
      units: "c",
    };
    const msg = cmdRemoveCity(config);
    expect(msg).toContain("inválida");
    expect(config.cities.length).toBe(1);
  });
});