import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { mkdirSync, rmSync, existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { defaultConfig, loadConfig, saveConfig } from "../src/config";
import type { Config } from "../src/config";

const TMP = join(tmpdir(), `weather-cli-test-${Math.random().toString(36).slice(2)}`);

const madrid = {
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

describe("config", () => {
  it("defaultConfig tiene valores vacíos y °C", () => {
    const c = defaultConfig();
    expect(c.defaultCity).toBeNull();
    expect(c.cities).toEqual([]);
    expect(c.units).toBe("c");
  });

  it("save y load hacen roundtrip", () => {
    const config: Config = {
      defaultCity: madrid,
      cities: [madrid],
      units: "f",
    };
    saveConfig(config);
    const file = join(TMP, "weather-cli", "config.json");
    expect(existsSync(file)).toBe(true);
    const loaded = loadConfig();
    expect(loaded).toEqual(config);
  });

  it("load sin archivo devuelve defaults", () => {
    const loaded = loadConfig();
    expect(loaded).toEqual(defaultConfig());
  });

  it("units inválidas caen a °C", () => {
    const dir = join(TMP, "weather-cli");
    mkdirSync(dir, { recursive: true });
    writeFileSync(
      join(dir, "config.json"),
      JSON.stringify({ defaultCity: null, cities: [], units: "x" }),
      "utf8",
    );
    const loaded = loadConfig();
    expect(loaded.units).toBe("c");
  });

  it("cities no数组 se normaliza a vacío", () => {
    const dir = join(TMP, "weather-cli");
    mkdirSync(dir, { recursive: true });
    writeFileSync(
      join(dir, "config.json"),
      JSON.stringify({
        defaultCity: null,
        cities: "no-es-array",
        units: "c",
      }),
      "utf8",
    );
    const loaded = loadConfig();
    expect(loaded.cities).toEqual([]);
  });
});