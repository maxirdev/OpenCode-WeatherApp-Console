import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { mkdirSync, rmSync, existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  loadCities,
  saveCities,
  addCity,
  removeCityByIndex,
  hasCity,
} from "../../src/storage/citiesStorage";
import type { City } from "../../src/types/City";

const TMP = join(tmpdir(), `weather-cli-test-${Math.random().toString(36).slice(2)}`);

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

beforeEach(() => {
  mkdirSync(TMP, { recursive: true });
  savedAppdata = process.env.APPDATA;
  savedXdg = process.env.XDG_CONFIG_HOME;
  process.env.APPDATA = TMP;
  process.env.XDG_CONFIG_HOME = TMP;
});

afterEach(() => {
  rmSync(TMP, { recursive: true, force: true });
  if (savedAppdata === undefined) delete process.env.APPDATA;
  else process.env.APPDATA = savedAppdata;
  if (savedXdg === undefined) delete process.env.XDG_CONFIG_HOME;
  else process.env.XDG_CONFIG_HOME = savedXdg;
});

describe("citiesStorage", () => {
  it("loadCities devuelve vacío si no existe el archivo", () => {
    expect(loadCities()).toEqual([]);
  });

  it("saveCities y loadCities hacen roundtrip", () => {
    saveCities([madrid, barcelona]);
    const file = join(TMP, "weather-cli", "cities.json");
    expect(existsSync(file)).toBe(true);
    expect(loadCities()).toEqual([madrid, barcelona]);
  });

  it("loadCities normaliza a vacío si el contenido no es array", () => {
    const dir = join(TMP, "weather-cli");
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "cities.json"), JSON.stringify("no-es-array"), "utf8");
    expect(loadCities()).toEqual([]);
  });

  it("hasCity detecta por id", () => {
    const cities = [madrid];
    expect(hasCity(cities, 1)).toBe(true);
    expect(hasCity(cities, 2)).toBe(false);
  });

  it("addCity persiste y evita duplicados por id", () => {
    const next = addCity([madrid], madrid);
    expect(next.length).toBe(1);
    const next2 = addCity(next, barcelona);
    expect(next2.length).toBe(2);
    expect(loadCities()).toEqual([madrid, barcelona]);
  });

  it("removeCityByIndex elimina y persiste", () => {
    const base = [madrid, barcelona];
    const { cities, removed } = removeCityByIndex(base, 0);
    expect(removed?.id).toBe(1);
    expect(cities.length).toBe(1);
    expect(cities[0]?.id).toBe(2);
    expect(loadCities()).toEqual([barcelona]);
  });

  it("removeCityByIndex con índice inválido no cambia nada", () => {
    const base = [madrid];
    const { cities, removed } = removeCityByIndex(base, 5);
    expect(removed).toBeNull();
    expect(cities).toEqual(base);
  });
});