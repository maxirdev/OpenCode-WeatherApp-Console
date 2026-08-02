import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { withSpinner } from "../../src/presentation/spinner";

let savedCi: string | undefined;

beforeEach(() => {
  savedCi = process.env.CI;
  process.env.CI = "1";
});

afterEach(() => {
  if (savedCi === undefined) delete process.env.CI;
  else process.env.CI = savedCi;
});

describe("withSpinner", () => {
  it("devuelve el valor de fn en modo no-TTY (CI)", async () => {
    const result = await withSpinner("cargando…", async () => 42);
    expect(result).toBe(42);
  });

  it("propaga el rechazo de fn", async () => {
    await expect(
      withSpinner("cargando…", async () => {
        throw new Error("boom");
      }),
    ).rejects.toThrow("boom");
  });
});