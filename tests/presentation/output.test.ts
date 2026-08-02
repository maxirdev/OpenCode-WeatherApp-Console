import { describe, it, expect, mock, beforeEach, afterEach } from "bun:test";
import { printMessage, ok, err } from "../../src/presentation/output";

const originalLog = console.log;
let logs: string[];

beforeEach(() => {
  logs = [];
  console.log = mock((...args: unknown[]) => {
    logs.push(args.map(String).join(" "));
  });
});

afterEach(() => {
  console.log = originalLog;
});

describe("printMessage", () => {
  it("imprime el mensaje recortando el espacio final", () => {
    printMessage("hola   ");
    expect(logs[0]).toBe("hola");
  });
});

describe("reexports", () => {
  it("ok y err son funciones", () => {
    expect(typeof ok).toBe("function");
    expect(typeof err).toBe("function");
    expect(typeof ok("x")).toBe("string");
    expect(typeof err("y")).toBe("string");
  });
});