# AGENTS.md

## Project Scope

- `minui` is a small Vite 8 + React 19 + TypeScript 6 UI codebase.
- Prefer the code and config files over [README.md](README.md); the README is still the default Vite template and is not project-specific.
- Use `pnpm` for dependency and script commands.

## Commands

- Install: `pnpm install`
- Dev server: `pnpm dev`
- Lint: `pnpm lint`
- Build/type-check: `pnpm build`
- There is no test script configured yet.

## Codebase Map

- `src/components/`: reusable UI components and imperative UI helpers.
- `src/hooks/`: custom React hooks.
- `src/modules/`: module-facing component copies or wrappers; inspect the matching component before changing behavior here.
- `src/styles/`: component SCSS, usually one `com.*.scss` file per component surface.
- `src/utils/`: DOM and time helpers used by multiple components.

## Working Conventions

- Use the `@/` alias for imports under `src`.
- Keep alias configuration in sync between [vite.config.ts](vite.config.ts) and [tsconfig.json](tsconfig.json).
- This repo already hit TypeScript 6 alias issues. Do not add `compilerOptions.baseUrl`; fix alias problems by updating `paths` in [tsconfig.json](tsconfig.json) and `resolve.alias` in [vite.config.ts](vite.config.ts).
- Keep `src/env.d.ts` with `declare module "*.scss";` so SCSS side-effect imports continue to type-check.
- Preserve each file's local style. Most TS and TSX files currently use double quotes and semicolons, but formatting is not fully uniform.
- Preserve the existing export shape. Components mix named exports and default exports.
- Keep `react-i18next` namespace-qualified keys in the existing format such as `t("common:loading")`.
- Many components use direct DOM APIs, portals, `dialog`, and manual event listeners. Make minimal changes and preserve cleanup behavior.

## Validation Expectations

- For component or hook edits, run the narrowest relevant check first, then fall back to `pnpm lint`.
- For changes to aliases, SCSS typing, or build config, always run `pnpm build`.
- If a change touches both a component and its paired stylesheet, validate both paths together before broadening scope.

## Good Starting Files

- [package.json](package.json)
- [tsconfig.json](tsconfig.json)
- [vite.config.ts](vite.config.ts)
- [src/components/Form.tsx](src/components/Form.tsx)
- [src/components/Dialog.tsx](src/components/Dialog.tsx)
- [src/utils/Dom.ts](src/utils/Dom.ts)