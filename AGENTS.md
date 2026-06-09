# AGENTS

## Scope

- This repository is a TypeScript ESM SDK for the Crefaz API.
- Prefer workspace-scoped customizations and keep changes minimal, local, and reversible.

## First Reads

- Read [knowledge/RUNTIME.md](knowledge/RUNTIME.md) for runtime, toolchain, and style expectations.
- Read [knowledge/ARCH.md](knowledge/ARCH.md) for architectural intent and error taxonomy.
- Read [knowledge/CREFAZ.md](knowledge/CREFAZ.md) for provider behavior, base URLs, auth, and async proposal flow.
- Read [knowledge/EVENTS.md](knowledge/EVENTS.md) before changing webhook parsing or event handling.
- Read [knowledge/TESTS.md](knowledge/TESTS.md) before proposing test strategy changes.

## Code Map

- [src/client.ts](src/client.ts) is the main facade and the primary behavior anchor.
- [src/index.ts](src/index.ts) is only the public barrel; do not treat it as runtime behavior.
- [src/modules/auth/contracts.ts](src/modules/auth/contracts.ts) and [src/modules/proposals/contracts.ts](src/modules/proposals/contracts.ts) define external-facing contracts.
- [src/shared/http.ts](src/shared/http.ts), [src/shared/errors.ts](src/shared/errors.ts), and [src/shared/json.ts](src/shared/json.ts) hold the transport, validation, and error normalization layer.
- [src/constants/cities.ts](src/constants/cities.ts) is generated from [docs/cidade_uf.xlsx](docs/cidade_uf.xlsx) by [scripts/generate-city-constants.mjs](scripts/generate-city-constants.mjs).

## Editing Rules

- Preserve NodeNext ESM conventions. In TypeScript source, keep relative imports ending in `.js`.
- Keep the public API stable through [src/index.ts](src/index.ts) unless the task explicitly requires a breaking export change.
- Prefer the existing internal error taxonomy over raw provider or fetch errors.
- Validate provider payloads before narrowing types; follow existing parse and ensure helpers instead of casting.
- Do not hand-edit generated city constants unless the task is explicitly a one-off probe. Change the spreadsheet source or the generator instead.
- Keep Portuguese terminology consistent with the provider contract where the public API already exposes it.

## Validation

- Use `pnpm run lint` for source linting.
- Use `pnpm run typecheck` for TypeScript validation.
- Use `pnpm run build` to validate generated constants and packaging.
- Do not rely on `pnpm test`; test scripts are not implemented yet.
- `pnpm run start` and `pnpm run dev` only execute the export barrel and are not behavior checks.

## Known Pitfalls

- The build script depends on the city generator and may fail because of local environment issues around `unzip`, not because of TypeScript changes.
- Authentication refresh is concurrency-sensitive in [src/client.ts](src/client.ts); keep the deduplication behavior intact.
- The architecture docs describe a broader target shape than the current codebase. Follow the current implementation first, and use the docs as directional guidance.

## Documentation Work

- When asked to create or update package documentation such as README, API usage docs, or llms.txt, do not invent behavior from the barrel file alone.
- Ground documentation in [package.json](package.json), [src/index.ts](src/index.ts), [src/client.ts](src/client.ts), and the knowledge files linked above.
- Link to existing knowledge documents instead of duplicating long architecture or testing explanations.
