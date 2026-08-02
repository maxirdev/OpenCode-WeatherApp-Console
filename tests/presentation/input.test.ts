import { describe, it, expect, mock, beforeEach, afterEach } from "bun:test";
import { promptText, promptNumber, promptIndex } from "../../src/presentation/input";

const originalPrompt = globalThis.prompt;

function setPrompt(value: string | null): void {
  globalThis.prompt = mock(() => value) as unknown as typeof prompt;
}

beforeEach(() => {
  setPrompt("");
});

afterEach(() => {
  globalThis.prompt = originalPrompt;
});

describe("promptText", () => {
  it("devuelve la cadena introducida", () => {
    setPrompt("Madrid");
    expect(promptText("Nombre: ")).toBe("Madrid");
  });

  it("devuelve cadena vacía si prompt retorna null", () => {
    setPrompt(null);
    expect(promptText("Nombre: ")).toBe("");
  });
});

describe("promptNumber", () => {
  it("parsea un entero", () => {
    setPrompt("42");
    expect(promptNumber("N: ")).toBe(42);
  });

  it("devuelve NaN si no es número", () => {
    setPrompt("abc");
    expect(Number.isNaN(promptNumber("N: "))).toBe(true);
  });
});

describe("promptIndex", () => {
  it("convierte 1-based a 0-based index", () => {
    setPrompt("2");
    const r = promptIndex("Elige: ", 3);
    expect(r.idx).toBe(1);
    expect(r.cancelled).toBe(false);
  });

  it("entrada vacía marca como cancelado con idx -1", () => {
    setPrompt("");
    const r = promptIndex("Elige: ", 3);
    expect(r.idx).toBe(-1);
    expect(r.cancelled).toBe(true);
  });

  it("no-numero deja idx -1 sin cancelar", () => {
    setPrompt("x");
    const r = promptIndex("Elige: ", 3);
    expect(r.idx).toBe(-1);
    expect(r.cancelled).toBe(false);
  });
});