import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { cmdToggleSettings } from "../../src/actions/toggleSettings";
import { loadSettings } from "../../src/storage/settingsStorage";
import type { Config } from "../../src/types/Config";

const TMP = join(tmpdir(), `weather-cli-toggle-${Math.random().toString(36).slice(2)}`);

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

function cfg(units: "c" | "f"): Config {
  return { defaultCity: null, cities: [], units };
}

describe("cmdToggleSettings", () => {
  it("cambia de °C a °F y persiste", () => {
    const config = cfg("c");
    const msg = cmdToggleSettings(config);
    expect(config.units).toBe("f");
    expect(msg).toContain("°F");
    expect(loadSettings().units).toBe("f");
  });

  it("cambia de °F a °C y persiste", () => {
    const config = cfg("f");
    const msg = cmdToggleSettings(config);
    expect(config.units).toBe("c");
    expect(msg).toContain("°C");
    expect(loadSettings().units).toBe("c");
  });

  it("dos toggles vuelven al estado inicial", () => {
    const config = cfg("c");
    cmdToggleSettings(config);
    cmdToggleSettings(config);
    expect(config.units).toBe("c");
    expect(loadSettings().units).toBe("c");
  });
});