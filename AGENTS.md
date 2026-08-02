# AGENTS.md

## Toolchain

- Bun is the runtime and package manager. Use `bun add` / `bun install` / `bun run`, never npm/yarn. Lockfile is `bun.lock`.
- Entrypoint is `index.ts` (declared as `module` in `package.json`). No npm scripts are defined.
- Run: `bun index.ts` (or `bun run index.ts`). Typecheck: `bunx tsc --noEmit` (tsconfig already has `noEmit: true` and `types: ["bun"]`).
- `tsconfig.json` is strict (`strict`, `noUncheckedIndexedAccess`, `verbatimModuleSyntax`), bundler resolution. Respect it; don't relax it without reason.

## Project

- Goal (per README, Spanish): a console app that takes a city name, shows its weather via OpenMeteo (free, no API key). Two-step flow: geocoding API to resolve city -> coords, then forecast API.
- Features planned: default city, a list of saved cities, add/remove cities, °C/°F setting, interactive menu.
- User-facing UI strings (menu, prompts, output) are in Spanish — keep new UI text Spanish to match.
- `index.ts` is still a `console.log("Hello via Bun!")` placeholder; the CLI is not yet implemented.
- Final deliverable is a compiled binary; output dirs `out/` and `dist/` are gitignored. Binary builds use `bun build --compile`.
