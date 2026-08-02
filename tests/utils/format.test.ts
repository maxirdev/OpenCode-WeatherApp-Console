import { describe, it, expect } from "bun:test";
import { regionOf, fmtDate } from "../../src/utils/format";
import type { City } from "../../src/types/City";

function city(partial: Partial<City>): City {
  return {
    id: 1,
    name: "X",
    latitude: 0,
    longitude: 0,
    country: "",
    admin1: "",
    ...partial,
  };
}

describe("regionOf", () => {
  it("une admin1 y country con coma", () => {
    expect(regionOf(city({ admin1: "Madrid", country: "España" }))).toBe(
      "Madrid, España",
    );
  });

  it("omite admin1 si está vacío", () => {
    expect(regionOf(city({ admin1: "", country: "España" }))).toBe("España");
  });

  it("omite country si está vacío", () => {
    expect(regionOf(city({ admin1: "Cataluña", country: "" }))).toBe(
      "Cataluña",
    );
  });

  it("devuelve cadena vacía si ambos vacíos", () => {
    expect(regionOf(city({}))).toBe("");
  });
});

describe("fmtDate", () => {
  it("formatea en es con weekday, day y month de 2 dígitos", () => {
    const out = fmtDate("2026-08-02");
    expect(out).toMatch(/\d{2}\/\d{2}/);
    expect(out.length).toBeGreaterThan(0);
  });

  it("usa separador de locale es", () => {
    const out = fmtDate("2026-01-05");
    expect(out).toMatch(/05\/01|05-01|05\.01/);
  });
});