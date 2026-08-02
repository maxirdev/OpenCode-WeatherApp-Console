import { describe, it, expect } from "bun:test";
import { weatherDescription } from "../../src/utils/weatherCodes";

describe("weatherDescription", () => {
  it("describe un cielo despejado", () => {
    expect(weatherDescription(0)).toBe("Despejado");
  });

  it("describe nublado", () => {
    expect(weatherDescription(3)).toBe("Nublado");
  });

  it("describe tormenta con granizo fuerte", () => {
    expect(weatherDescription(99)).toBe("Tormenta con granizo fuerte");
  });

  it("devuelve Desconocido para códigos no mapeados", () => {
    expect(weatherDescription(1234)).toBe("Desconocido");
  });
});