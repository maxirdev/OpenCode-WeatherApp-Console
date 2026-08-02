import { describe, it, expect, mock, beforeEach, afterEach } from "bun:test";
import { geocodeCity, getForecast } from "../src/api";

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

describe("getForecast", () => {
  it("devuelve current + 7 días", async () => {
    mockFetch({
      "api.open-meteo.com/v1/forecast": {
        current_units: {
          temperature_2m: "°C",
          wind_speed_10m: "km/h",
        },
        current: {
          temperature_2m: 21.3,
          relative_humidity_2m: 50,
          wind_speed_10m: 10,
          weather_code: 2,
        },
        daily: {
          time: ["2026-08-01", "2026-08-02"],
          weather_code: [0, 3],
          temperature_2m_max: [25, 22],
          temperature_2m_min: [15, 12],
          precipitation_sum: [0, 1.2],
        },
      },
    });
    const f = await getForecast(40.4, -3.7, "c");
    expect(f.temperature).toBe(21.3);
    expect(f.tempUnit).toBe("°C");
    expect(f.daily.length).toBe(2);
    expect(f.daily[0]?.tMax).toBe(25);
    expect(f.daily[1]?.precip).toBe(1.2);
  });

  it("usa fahrenheit cuando units=f", async () => {
    let captured = "";
    const spy = mock((url: string) => {
      captured = url;
      return Promise.resolve(
        new Response(
          JSON.stringify({
            current_units: { temperature_2m: "°F", wind_speed_10m: "mph" },
            current: {
              temperature_2m: 70,
              relative_humidity_2m: 40,
              wind_speed_10m: 5,
              weather_code: 0,
            },
            daily: {
              time: ["2026-08-01"],
              weather_code: [0],
              temperature_2m_max: [70],
              temperature_2m_min: [60],
              precipitation_sum: [0],
            },
          }),
          { status: 200 },
        ),
      );
    });
    globalThis.fetch = spy as unknown as typeof fetch;
    const f = await getForecast(1, 2, "f");
    expect(captured).toContain("temperature_unit=fahrenheit");
    expect(captured).toContain("wind_speed_unit=mph");
    expect(f.tempUnit).toBe("°F");
  });
});