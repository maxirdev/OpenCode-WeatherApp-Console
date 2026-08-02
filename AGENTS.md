# AGENTS.md

## Toolchain

- Bun is the runtime and package manager. Use `bun add` / `bun install` / `bun run`, never npm/yarn. Lockfile is `bun.lock`.
- Entrypoint is `index.ts` (declared as `module` in `package.json`). Scripts in `package.json`: `start` (`bun run index.ts`), `dev` (`bun run index.ts --watch`), `build` (`bun build --compile index.ts --outfile weather`), plus `test` coverage via `bun test`.
- Run: `bun run start`. Typecheck: `bunx tsc --noEmit` (tsconfig already has `noEmit: true` and `types: ["bun"]`). Tests: `bun test` (uses `bun:test`; suites live in `tests/`).
- `tsconfig.json` is strict (`strict`, `noUncheckedIndexedAccess`, `verbatimModuleSyntax`), bundler resolution. Respect it; don't relax it without reason.
- Runtime dependency: `picocolors` (ANSI colors, auto-detects TTY). Don't hand-roll escape codes; use `src/colors.ts` helpers.

## Project

- Goal (per README, Spanish): a console app that takes a city name, shows its weather via OpenMeteo (free, no API key). Two-step flow: geocoding API to resolve city -> coords, then forecast API.
- Features implemented: default city, a list of saved cities, add/remove cities, °C/°F setting, 7-day forecast, interactive menu with colored output and a loading spinner.
- Architecture: `index.ts` defines a `commands` table (id/label/run) that drives the menu and dispatch. Adding a feature = append a `Command` to the table; `src/menu.ts` renders from it generically. Keep this pattern for extensibility.
- Modules under `src/`: `api.ts` (geocoding + forecast, including daily 7-day), `config.ts` (XDG/APPDATA-backed JSON config), `display.ts` (returns formatted strings, never `console.log`), `menu.ts` (render + read option), `colors.ts` (picocolors helpers), `spinner.ts` (TTY spinner via `\r`), `weather_codes.ts` (WMO code -> Spanish).
- UI flow: actions return a string (the message to persist); `main` stores it as `lastMessage` and `renderMenu` prints it above the menu on the next cycle. No "(Enter para continuar)" pause.
- User-facing UI strings (menu, prompts, output) are in Spanish — keep new UI text Spanish to match.
- Config path: `~/.config/weather-cli/config.json` on POSIX, `%APPDATA%\weather-cli\config.json` on Windows.
- Final deliverable is a compiled binary; output dirs `out/` and `dist/` are gitignored. Binary builds use `bun build --compile`.
