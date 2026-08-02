import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { tmpdir, homedir } from "node:os";
import { join } from "node:path";
import { mkdirSync, rmSync } from "node:fs";
import { appDir, appFile } from "../../src/utils/paths";
import { APP_NAME } from "../../src/utils/constants";

const TMP = join(tmpdir(), `weather-cli-paths-${Math.random().toString(36).slice(2)}`);

let savedAppdata: string | undefined;
let savedXdg: string | undefined;
let savedPlatform: typeof process.platform;

beforeEach(() => {
  mkdirSync(TMP, { recursive: true });
  savedAppdata = process.env.APPDATA;
  savedXdg = process.env.XDG_CONFIG_HOME;
  savedPlatform = process.platform;
  delete process.env.APPDATA;
  delete process.env.XDG_CONFIG_HOME;
});

afterEach(() => {
  rmSync(TMP, { recursive: true, force: true });
  if (savedAppdata === undefined) delete process.env.APPDATA;
  else process.env.APPDATA = savedAppdata;
  if (savedXdg === undefined) delete process.env.XDG_CONFIG_HOME;
  else process.env.XDG_CONFIG_HOME = savedXdg;
  (process as { platform: string }).platform = savedPlatform;
});

describe("appDir", () => {
  it("usa APPDATA en win32", () => {
    (process as { platform: string }).platform = "win32";
    process.env.APPDATA = TMP;
    expect(appDir()).toBe(join(TMP, APP_NAME));
  });

  it("usa XDG_CONFIG_HOME en posix", () => {
    (process as { platform: string }).platform = "linux";
    process.env.XDG_CONFIG_HOME = TMP;
    expect(appDir()).toBe(join(TMP, APP_NAME));
  });

  it("fallback a ~/.config si no hay XDG en posix", () => {
    (process as { platform: string }).platform = "linux";
    delete process.env.XDG_CONFIG_HOME;
    const expected = join(homedir(), ".config", APP_NAME);
    expect(appDir()).toBe(expected);
  });
});

describe("appFile", () => {
  it("resuelve un archivo dentro de appDir", () => {
    (process as { platform: string }).platform = "win32";
    process.env.APPDATA = TMP;
    expect(appFile("cities.json")).toBe(join(TMP, APP_NAME, "cities.json"));
  });
});