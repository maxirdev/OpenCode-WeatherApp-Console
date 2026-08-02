import { describe, it, expect, mock, beforeEach, afterEach } from "bun:test";
import { runMenu } from "../src/index";
import type { Config } from "../src/types/Config";
import type { Command } from "../src/types/MenuOption";
import type { MenuIO } from "../src/index";

const baseConfig: Config = { defaultCity: null, cities: [], units: "c" };

const originalLog = console.log;

beforeEach(() => {
  console.log = mock(() => {});
});

afterEach(() => {
  console.log = originalLog;
});

function makeIO(opts: (string | null)[]): {
  io: MenuIO;
  rendered: (string | undefined)[];
} {
  const q = [...opts];
  const rendered: (string | undefined)[] = [];
  const io: MenuIO = {
    render: mock((_cfg, _cmds, lastMessage) => {
      rendered.push(lastMessage);
    }) as unknown as MenuIO["render"],
    read: mock(() => q.shift() ?? null) as unknown as MenuIO["read"],
  };
  return { io, rendered };
}

describe("runMenu", () => {
  it("sale con la opción 9", async () => {
    const { io } = makeIO(["9"]);
    await runMenu(baseConfig, [
      { id: "9", label: () => "Salir", run: () => "" },
    ], io);
    expect((io.read as ReturnType<typeof mock>).mock.calls.length).toBe(1);
  });

  it("sale si read devuelve null", async () => {
    const { io } = makeIO([null]);
    await runMenu(baseConfig, [
      { id: "9", label: () => "Salir", run: () => "" },
    ], io);
    expect((io.read as ReturnType<typeof mock>).mock.calls.length).toBe(1);
  });

  it("opción inválida fija lastMessage y re-renderiza", async () => {
    const { io, rendered } = makeIO(["7", "9"]);
    await runMenu(baseConfig, [
      { id: "9", label: () => "Salir", run: () => "" },
    ], io);
    expect(rendered[1]).toContain("inválida");
  });

  it("dispatcha al comando y propaga su resultado", async () => {
    const { io, rendered } = makeIO(["1", "9"]);
    const run = mock(() => "resultado-ok");
    const cmds: Command[] = [
      { id: "1", label: () => "A", run: run as unknown as Command["run"] },
      { id: "9", label: () => "Salir", run: () => "" },
    ];
    await runMenu(baseConfig, cmds, io);
    expect(run).toHaveBeenCalledTimes(1);
    expect(rendered[1]).toBe("resultado-ok");
  });

  it("captura excepción del comando como mensaje de error", async () => {
    const { io, rendered } = makeIO(["1", "9"]);
    const cmds: Command[] = [
      {
        id: "1",
        label: () => "A",
        run: () => {
          throw new Error("boom");
        },
      },
      { id: "9", label: () => "Salir", run: () => "" },
    ];
    await runMenu(baseConfig, cmds, io);
    expect(rendered[1]).toContain("Error inesperado");
    expect(rendered[1]).toContain("boom");
  });

  it("re-renderiza después de cada opción válida", async () => {
    const { io } = makeIO(["1", "2", "9"]);
    const cmds: Command[] = [
      { id: "1", label: () => "A", run: () => "m1" },
      { id: "2", label: () => "B", run: () => "m2" },
      { id: "9", label: () => "Salir", run: () => "" },
    ];
    await runMenu(baseConfig, cmds, io);
    expect((io.read as ReturnType<typeof mock>).mock.calls.length).toBe(3);
  });
});