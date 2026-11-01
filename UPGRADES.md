# Dependency upgrades

Audit date: 2026-11-01. Versions below compare declared minimum versions on master (`783008c`) and after the upgrade. The lockfile also refreshes transitive dependencies.

Applied 35 direct dependency updates: 20 major, 10 minor, and 5 patch.

| Package                            | Before  | After   | Upgrade |
| ---------------------------------- | ------- | ------- | ------- |
| `@changesets/cli`                  | 2.31.1  | 3.0.3   | major   |
| `@sveltejs/adapter-auto`           | 7.0.1   | 8.0.0   | major   |
| `@sveltejs/adapter-cloudflare`     | 7.2.9   | 8.0.2   | major   |
| `@sveltejs/adapter-node`           | 5.5.7   | 6.0.1   | major   |
| `@sveltejs/kit`                    | 2.70.2  | 3.1.1   | major   |
| `@sveltejs/package`                | 2.5.8   | 3.0.2   | major   |
| `@sveltejs/vite-plugin-svelte`     | 6.2.4   | 7.3.1   | major   |
| `@vitest/browser`                  | 3.2.7   | 5.0.5   | major   |
| `@vitest/ui`                       | 3.2.7   | 5.0.5   | major   |
| `eslint`                           | 9.39.5  | 10.14.0 | major   |
| `eslint-plugin-simple-import-sort` | 12.1.1  | 14.0.0  | major   |
| `eslint-plugin-yml`                | 1.19.1  | 3.9.0   | major   |
| `globals`                          | 16.5.0  | 17.14.0 | major   |
| `prettier-plugin-svelte`           | 3.5.2   | 4.1.1   | major   |
| `typescript`                       | 5.9.3   | 6.0.3   | major   |
| `uuid`                             | 13.0.2  | 14.0.3  | major   |
| `vite`                             | 7.3.6   | 8.3.5   | major   |
| `vitest`                           | 3.2.7   | 5.0.5   | major   |
| `vitest-browser-svelte`            | 0.1.0   | 3.1.0   | major   |
| `yaml-eslint-parser`               | 1.3.2   | 2.1.0   | major   |
| `@types/node`                      | 24.13.3 | 24.19.2 | minor   |
| `eslint-plugin-svelte`             | 3.22.0  | 3.23.1  | minor   |
| `highlight.js`                     | 11.11.1 | 11.12.0 | minor   |
| `lint-staged`                      | 17.3.0  | 17.6.0  | minor   |
| `playwright`                       | 1.62.1  | 1.64.1  | minor   |
| `sass-embedded`                    | 1.100.0 | 1.107.1 | minor   |
| `svelte`                           | 5.56.8  | 5.57.3  | minor   |
| `svelte-highlight`                 | 7.16.2  | 7.23.1  | minor   |
| `typescript-eslint`                | 8.65.0  | 8.72.1  | minor   |
| `wrangler`                         | 4.118.0 | 4.156.0 | minor   |
| `@eslint/compat`                   | 2.1.0   | 2.1.1   | patch   |
| `prettier`                         | 3.9.6   | 3.9.10  | patch   |
| `publint`                          | 0.3.22  | 0.3.25  | patch   |
| `svelte-check`                     | 4.7.4   | 4.7.7   | patch   |
| `vite-plugin-devtools-json`        | 1.1.0   | 1.1.2   | patch   |

Added `@sveltejs/load-config` 0.2.3 for ESLint configuration loading and `@vitest/browser-playwright` 5.0.5 for browser tests. Unchanged dependencies were already at their latest stable release.

## Compatibility decisions

- TypeScript 7.0.2 is available, but `svelte-check` 4.7.7 accepts TypeScript 5/6 and `typescript-eslint` 8.72.1 requires TypeScript below 6.1. Use 6.0.3 until both tools support 7.
- `@types/node` 26.6.6 is available. Use 24.19.2 to match the repository's Node 24 runtime; CI moves from 24.7.0 to 24.22.2.
- The published Svelte peer range remains unchanged because the library source does not require new Svelte APIs.

## Tooling and CI

- pnpm 10.17.1 → 12.16.1; engine enforcement and build permissions move to `pnpm-workspace.yaml`. The native Parcel watcher build is explicitly allowed. pnpm added an exact release-age exception for `globals@17.14.0` while selecting the requested latest release.
- GitHub Actions: checkout v5 → v7, setup-node v4 → v7, pnpm/action-setup v4 → v6, paths-filter v3 → v4, action-gh-release v2 → v3, wrangler-action v3 → v4, changesets/action v1 → v2.
- Changesets v2 inputs use `publish-script`, `commit-message`, and `pr-title`.
- SvelteKit configuration moves into the existing Vite config, preserving adapters and CSP. TypeScript extends `$app/tsconfig`; source imports use `#lib`.
- Vitest uses its Playwright provider package and `vitest/browser` entry point. YAML parsing uses namespace imports.

## Migration references

- [SvelteKit 3 migration](https://svelte.dev/docs/kit/migrating-to-sveltekit-3)
- [Vite 8 migration](https://vite.dev/guide/migration)
- [Vitest 4 migration](https://v4.vitest.dev/guide/migration.html) and [Vitest 5 migration](https://vitest.dev/guide/migration/)
- [pnpm migration](https://pnpm.io/migration)

## Validation

- Frozen pnpm install passed (Husky setup skipped locally because linked-worktree Git metadata is read-only in the sandbox).
- `pnpm check`: 0 errors, 0 warnings.
- `pnpm lint`: passed.
- `CI=true pnpm test`: 5 test files and 14 tests passed, including Playwright Chromium browser tests.
- `pnpm build`: Cloudflare build, Svelte packaging, and publint passed.
- `ENVIRONMENT=ci pnpm build`: Node build, Svelte packaging, and publint passed.
- Both changed Svelte components passed the Svelte autofixer without findings.
- Workflow YAML parses and all action inputs match the upgraded actions' published schemas. Hosted CI and deployment have not run.
- `pnpm outdated` reports only the two intentional compatibility limits above.

Local validation used Node 24.22.2 and pnpm 12.16.1. Sandbox-only paths were redirected using `XDG_RUNTIME_DIR=/tmp/ember-runtime`, `PLAYWRIGHT_BROWSERS_PATH=/tmp/ember-playwright`, `WRANGLER_REGISTRY_PATH=/tmp/ember-wrangler-registry`, and `WRANGLER_LOG_PATH=/tmp/ember-wrangler-logs`. These overrides are not repository configuration.
