import { describe, it, expect, mock, beforeEach, afterEach } from "bun:test";
import { renderMenu, readMenuOption } from "../../src/presentation/menu";
import type { Config } from "../../src/types/Config";
import type { Command } from "../../src/types/MenuOption";

const config: Config = {
  defaultCity: null,
  cities: [],
  units: "c",
};

const commands: Command[] = [
  { id: "1", label: () => "Ver clima", run: () => "ok" },
  { id: "9", label: () => "Salir", run: () => "" },
];

const originalPrompt = globalThis.prompt;
const originalClear = console.clear;
const originalLog = console.log;

let logs: string[];

beforeEach(() => {
  logs = [];
  globalThis.prompt = mock(() => "1") as unknown as typeof prompt;
  console.clear = mock(() => {});
  console.log = mock((...args: unknown[]) => {
    logs.push(args.map(String).join(" "));
  });
});

afterEach(() => {
  globalThis.prompt = originalPrompt;
  console.clear = originalClear;
  console.log = originalLog;
});

describe("renderMenu", () => {
  it("pinta el título y cada opción con su id", () => {
    renderMenu(config, commands, undefined);
    expect(logs.some((l) => l.includes("WEATHER CLI"))).toBe(true);
    expect(logs.some((l) => l.includes("Ver clima"))).toBe(true);
    expect(logs.some((l) => l.includes("Salir"))).toBe(true);
  });

  it("muestra el último mensaje y el separador si se pasa", () => {
    renderMenu(config, commands, "mensaje previo");
    expect(logs.some((l) => l.includes("mensaje previo"))).toBe(true);
  });

  it("muestra la ciudad default si está definida", () => {
    const cfg: Config = {
      ...config,
      defaultCity: {
        id: 7,
        name: "Toledo",
        latitude: 0,
        longitude: 0,
        country: "España",
        admin1: "",
      },
    };
    renderMenu(cfg, commands, undefined);
    expect(logs.some((l) => l.includes("Toledo"))).toBe(true);
  });
});

describe("readMenuOption", () => {
  it("devuelve lo que introduce el usuario", () => {
    globalThis.prompt = mock(() => "3") as unknown as typeof prompt;
    expect(readMenuOption()).toBe("3");
  });

  it("devuelve null si prompt cancela", () => {
    globalThis.prompt = mock(() => null) as unknown as typeof prompt;
    expect(readMenuOption()).toBeNull();
  });
});