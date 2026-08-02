import { describe, it, expect, mock, beforeEach, afterEach } from "bun:test";
import { getForecast } from "../../src/api/weather";

const originalFetch = globalThis.fetch;

beforeEach(() => {
  globalThis.fetch = mock((_url: string) =>
    Promise.resolve(new Response(JSON.stringify({}), { status: 200 })),
  ) as unknown as typeof fetch;
});

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("getForecast", () => {
  it("devuelve current + 7 días", async () => {
    globalThis.fetch = mock((_url: string) =>
      Promise.resolve(
        new Response(
          JSON.stringify({
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
          }),
          { status: 200 },
        ),
      ),
    ) as unknown as typeof fetch;
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