import { describe, it, expect } from "bun:test";
import { listCities } from "../../src/actions/listCities";
import type { City } from "../../src/types/City";

function c(id: number, name: string, region = "", country = "España"): City {
  return { id, name, latitude: 0, longitude: 0, country, admin1: region };
}

describe("listCities", () => {
  it("lista vacía devuelve mensaje", () => {
    expect(listCities([])).toBe("No hay ciudades guardadas.");
  });

  it("lista con ciudades muestra cabecera y cada ciudad", () => {
    const out = listCities([c(1, "Madrid", "Madrid"), c(2, "Bilbao", "Vizcaya")]);
    expect(out).toContain("Ciudades guardadas:");
    expect(out).toContain("1. Madrid");
    expect(out).toContain("Madrid, España");
    expect(out).toContain("2. Bilbao");
    expect(out).toContain("Vizcaya, España");
  });

  it("omite la región si está vacía", () => {
    const out = listCities([c(1, "Paris", "", "Francia")]);
    expect(out).toContain("1. Paris");
    expect(out).toContain("Francia");
    expect(out).not.toContain(",  España");
  });
});