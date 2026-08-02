import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { mkdirSync, rmSync, existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  defaultSettings,
  loadSettings,
  saveSettings,
  setUnits,
  setDefaultCity,
} from "../../src/storage/settingsStorage";
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

describe("settingsStorage", () => {
  it("defaultSettings tiene °C y defaultCity null", () => {
    const s = defaultSettings();
    expect(s.units).toBe("c");
    expect(s.defaultCity).toBeNull();
  });

  it("loadSettings devuelve defaults si no existe el archivo", () => {
    expect(loadSettings()).toEqual(defaultSettings());
  });

  it("saveSettings y loadSettings hacen roundtrip", () => {
    saveSettings({ units: "f", defaultCity: madrid });
    const file = join(TMP, "weather-cli", "settings.json");
    expect(existsSync(file)).toBe(true);
    const loaded = loadSettings();
    expect(loaded.units).toBe("f");
    expect(loaded.defaultCity).toEqual(madrid);
  });

  it("units inválidas caen a °C", () => {
    const dir = join(TMP, "weather-cli");
    mkdirSync(dir, { recursive: true });
    writeFileSync(
      join(dir, "settings.json"),
      JSON.stringify({ units: "x", defaultCity: null }),
      "utf8",
    );
    expect(loadSettings().units).toBe("c");
  });

  it("setUnits persiste el cambio", () => {
    const next = setUnits("f");
    expect(next.units).toBe("f");
    expect(loadSettings().units).toBe("f");
  });

  it("setDefaultCity persista la ciudad", () => {
    const next = setDefaultCity(madrid);
    expect(next.defaultCity).toEqual(madrid);
    expect(loadSettings().defaultCity).toEqual(madrid);
  });

  it("setDefaultCity null limpia la default", () => {
    setDefaultCity(madrid);
    const next = setDefaultCity(null);
    expect(next.defaultCity).toBeNull();
    expect(loadSettings().defaultCity).toBeNull();
  });
});