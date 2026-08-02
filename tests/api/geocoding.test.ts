import { describe, it, expect, mock, beforeEach, afterEach } from "bun:test";
import { geocodeCity } from "../../src/api/geocoding";

const originalFetch = globalThis.fetch;

function mockFetch(responses: Record<string, unknown>): void {
  const handler = mock((url: string) => {
    const key = Object.keys(responses).find((k) => url.includes(k));
    if (!key) {
      return Promise.resolve(
        new Response(JSON.stringify({ error: "not found" }), {
          status: 404,
        }),
      );
    }
    return Promise.resolve(
      new Response(JSON.stringify(responses[key]), { status: 200 }),
    );
  });
  globalThis.fetch = handler as unknown as typeof fetch;
}

beforeEach(() => {
  mockFetch({});
});

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("geocodeCity", () => {
  it("devuelve hasta 5 coincidencias", async () => {
    mockFetch({
      "geocoding-api.open-meteo.com": {
        results: [
          {
            id: 1,
            name: "Madrid",
            latitude: 40.4,
            longitude: -3.7,
            country: "España",
            admin1: "Madrid",
          },
          {
            id: 2,
            name: "Madrid",
            latitude: 40.0,
            longitude: -3.5,
            country: "Estados Unidos",
            admin1: "Iowa",
          },
        ],
      },
    });
    const results = await geocodeCity("Madrid");
    expect(results.length).toBe(2);
    expect(results[0]?.name).toBe("Madrid");
    expect(results[1]?.admin1).toBe("Iowa");
  });

  it("devuelve vacío si no hay results", async () => {
    mockFetch({ "geocoding-api.open-meteo.com": {} });
    const results = await geocodeCity("CiudadInexistente");
    expect(results).toEqual([]);
  });

  it("lanza si la API responde error", async () => {
    const fail = mock((_url: string) =>
      Promise.resolve(new Response("err", { status: 500 })),
    );
    globalThis.fetch = fail as unknown as typeof fetch;
    await expect(geocodeCity("x")).rejects.toThrow("Geocoding API error: 500");
  });
});