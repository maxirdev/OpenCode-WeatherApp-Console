# AGENTS.md

## Toolchain

- Bun is the runtime and package manager. Use `bun add` / `bun install` / `bun run`, never npm/yarn. Lockfile is `bun.lock`.
- Entrypoint is `src/index.ts` (declared as `module` in `package.json`). Scripts in `package.json`: `start` (`bun run src/index.ts`), `dev` (`bun run src/index.ts --watch`), `build` (`bun build --compile src/index.ts --outfile ./out/weather`), plus `test` coverage via `bun test`.
- Run: `bun run start`. Typecheck: `bunx tsc --noEmit` (tsconfig already has `noEmit: true` and `types: ["bun"]`). Tests: `bun test` (uses `bun:test`; suites live in `tests/`, nested by layer: `tests/api`, `tests/storage`, `tests/utils`).
- `tsconfig.json` is strict (`strict`, `noUncheckedIndexedAccess`, `verbatimModuleSyntax`), bundler resolution. Respect it; don't relax it without reason.
- Runtime dependency: `picocolors` (ANSI colors, auto-detects TTY). Don't hand-roll escape codes; use `src/utils/colors.ts` helpers.

## Project

- Goal (per README, Spanish): a console app that takes a city name, shows its weather via OpenMeteo (free, no API key). Two-step flow: geocoding API to resolve city -> coords, then forecast API.
- Features implemented: default city, a list of saved cities, add/remove cities, °C/°F setting, 7-day forecast, interactive menu with colored output and a loading spinner.
- Architecture: `src/index.ts` defines a `commands` table (id/label/run) that drives the menu and dispatch. Adding a feature = create a new `src/actions/*.ts` returning a string message, then append a `Command` to the table in `src/index.ts`; `src/presentation/menu.ts` renders from it generically. Keep this pattern for extensibility.
- Source is layered under `src/` (see `references/file-system.md`):
  - `actions/` — user-facing actions, each returns the message string to display (`getWeather`, `getDailyForecast`, `addCity`, `removeCity`, `setDefaultCity`, `listCities`, `toggleSettings`).
  - `presentation/` — console interaction: `menu.ts` (render + read option), `display.ts` (weather/daily blocks, returns strings, never `console.log`), `output.ts` (message helpers + `ok`/`err`), `input.ts` (prompt helpers), `spinner.ts` (TTY spinner via `\r`).
  - `storage/` — local persistence: `citiesStorage.ts` (`cities.json`), `settingsStorage.ts` (`settings.json`, holds `units` + `defaultCity`). Files live under the app dir (`%APPDATA%\weather-cli` on Windows, `$XDG_CONFIG_HOME/weather-cli` or `~/.config/weather-cli` on POSIX), resolved by `utils/paths.ts`. There is **no migration** from the legacy single `config.json` — starting fresh.
  - `types/` — shared TS types: `City`, `Units`, `Config`, `Weather` (`Forecast`/`DailyEntry`), `MenuOption` (`Command`).
  - `api/` — OpenMeteo integration: `geocoding.ts` (city -> coords), `weather.ts` (current + 7-day forecast).
  - `utils/` — `format.ts` (`regionOf`, `fmtDate`), `constants.ts` (`GEO_URL`, `FORECAST_URL`, `MENU_SEP`, `APP_NAME`, `LANG`), `paths.ts` (`appDir`/`appFile`), `colors.ts` (picocolors helpers), `weatherCodes.ts` (WMO code -> Spanish).
- The `Config` type is composed in-memory by `loadConfig()` in `src/index.ts` (reads `loadCities()` + `loadSettings()`); actions mutate this live object **and** persist to the relevant storage file. The `commands` table and `menu` consume `Config` for labels.
- UI flow: actions return a string (the message to persist); `main` stores it as `lastMessage` and `renderMenu` prints it above the menu on the next cycle. No "(Enter para continuar)" pause.
- User-facing UI strings (menu, prompts, output) are in Spanish — keep new UI text Spanish to match.
- Storage paths: `~/.config/weather-cli/{cities.json,settings.json}` on POSIX, `%APPDATA%\weather-cli\{cities.json,settings.json}` on Windows.
- Final deliverable is a compiled binary; output dirs `out/` and `dist/` are gitignored. Binary builds use `bun build --compile`.
