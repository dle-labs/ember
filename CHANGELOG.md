# @dle.dev/ember

## 3.3.0

### Minor Changes

- a9056d2: Add controlled, accessible TreeView rendering with independent expansion and selection, indexed navigation, keyboard focus recovery, and active-path reveal that respects manual collapse. Add a data-only tree entry point with validated indexes, immutable CRUD and moves, a snapshot controller, and flat/nested-array conversion utilities. Preserve legacy exports while fixing input identity changes and nested transition configuration in Tree. Update examples and document mutation complexity and ordering constraints.

### Patch Changes

- cbf8738: Maintenance: Update dependency svelte to ^5.57.3
- a9056d2: Restore tree keyboard navigation after activating or toggling a row through snippet controls. Support empty-string IDs consistently in active-path reveal, keyboard navigation and focus recovery, while preserving independent embedded controls' keyboard behavior.

## 3.2.6

### Patch Changes

- 8a7ffa4: Restore npm trusted publishing on a GitHub-hosted runner, update repository metadata, and report successful releases to Changesets Action v2.

## 3.2.5

### Patch Changes

- 32858d8: Remove the release-script output test from the test suite.
- 420ae98: Maintenance: Add changesets to Renovate dependency PRs
- 6b8c939: Maintenance: Update Patch & Minor
- 38be6eb: Update the build, packaging, and test toolchain to SvelteKit 3, Vite 8, and Vitest 5, and refresh compatible dependencies.

## 3.2.4

### Patch Changes

- 689ca6a: Update the release workflow to use npm trusted publishing and keep the
  publishing path aligned with the current branch-based release process.

## 3.2.3

### Patch Changes

- 1f46cdd: Make the release script retryable when a release tag already exists but the npm
  version was not published, and publish scoped releases with explicit public
  access.

## 3.2.2

### Patch Changes

- 1be54a5: Harden CI and release workflows so staging deploys wait for checks, production
  publishes only run for version tags, release notes run correctly on Node 24, and
  npm publishing happens after the release tag is pushed.

## 3.2.1

### Patch Changes

- b802e01: # Maintenance: dependency updates
  - Updated the `svelte` peer dependency range from `^5.46.1` to `^5.53.5`.
  - Refreshed development dependency versions across SvelteKit adapters/tooling, Vite/Tailwind, ESLint plugins, Prettier tooling, TypeScript ESLint, and Wrangler.
  - This release contains maintenance updates only (package metadata and lockfile), with no source code changes under `src/`.

## 3.2.0

### Minor Changes

- 5648f75: Add transition options

## 3.1.1

### Patch Changes

- 09c7482: Add msising tree utils exports

## 3.1.0

### Minor Changes

- 66c4bb4: # Dependency Updates

  | Package                                                                                                                                                                                        | Change                                                                                               | Age                                                                                                                                                      | Confidence                                                                                                                                                                   |
  | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | [@eslint/compat](https://redirect.github.com/eslint/rewrite/tree/main/packages/compat#readme) ([source](https://redirect.github.com/eslint/rewrite/tree/HEAD/packages/compat))                 | [`^1.4.0` -> `^1.4.1`](https://renovatebot.com/diffs/npm/@eslint%2fcompat/1.4.0/1.4.1)               | [![age](https://developer.mend.io/api/mc/badges/age/npm/@eslint%2fcompat/1.4.1?slim=true)](https://docs.renovatebot.com/merge-confidence/)               | [![confidence](https://developer.mend.io/api/mc/badges/confidence/npm/@eslint%2fcompat/1.4.0/1.4.1?slim=true)](https://docs.renovatebot.com/merge-confidence/)               |
  | [@eslint/js](https://eslint.org) ([source](https://redirect.github.com/eslint/eslint/tree/HEAD/packages/js))                                                                                   | [`^9.39.1` -> `^9.39.2`](https://renovatebot.com/diffs/npm/@eslint%2fjs/9.39.1/9.39.2)               | [![age](https://developer.mend.io/api/mc/badges/age/npm/@eslint%2fjs/9.39.2?slim=true)](https://docs.renovatebot.com/merge-confidence/)                  | [![confidence](https://developer.mend.io/api/mc/badges/confidence/npm/@eslint%2fjs/9.39.1/9.39.2?slim=true)](https://docs.renovatebot.com/merge-confidence/)                 |
  | [@sveltejs/adapter-cloudflare](https://svelte.dev/docs/kit/adapter-cloudflare) ([source](https://redirect.github.com/sveltejs/kit/tree/HEAD/packages/adapter-cloudflare))                      | [`^7.2.3` -> `^7.2.4`](https://renovatebot.com/diffs/npm/@sveltejs%2fadapter-cloudflare/7.2.4/7.2.4) | [![age](https://developer.mend.io/api/mc/badges/age/npm/@sveltejs%2fadapter-cloudflare/7.2.4?slim=true)](https://docs.renovatebot.com/merge-confidence/) | [![confidence](https://developer.mend.io/api/mc/badges/confidence/npm/@sveltejs%2fadapter-cloudflare/7.2.4/7.2.4?slim=true)](https://docs.renovatebot.com/merge-confidence/) |
  | [@sveltejs/kit](https://svelte.dev) ([source](https://redirect.github.com/sveltejs/kit/tree/HEAD/packages/kit))                                                                                | [`^2.48.5` -> `^2.49.2`](https://renovatebot.com/diffs/npm/@sveltejs%2fkit/2.49.0/2.49.2)            | [![age](https://developer.mend.io/api/mc/badges/age/npm/@sveltejs%2fkit/2.49.2?slim=true)](https://docs.renovatebot.com/merge-confidence/)               | [![confidence](https://developer.mend.io/api/mc/badges/confidence/npm/@sveltejs%2fkit/2.49.0/2.49.2?slim=true)](https://docs.renovatebot.com/merge-confidence/)              |
  | [@sveltejs/package](https://svelte.dev) ([source](https://redirect.github.com/sveltejs/kit/tree/HEAD/packages/package))                                                                        | [`^2.5.6` -> `^2.5.7`](https://renovatebot.com/diffs/npm/@sveltejs%2fpackage/2.5.7/2.5.7)            | [![age](https://developer.mend.io/api/mc/badges/age/npm/@sveltejs%2fpackage/2.5.7?slim=true)](https://docs.renovatebot.com/merge-confidence/)            | [![confidence](https://developer.mend.io/api/mc/badges/confidence/npm/@sveltejs%2fpackage/2.5.7/2.5.7?slim=true)](https://docs.renovatebot.com/merge-confidence/)            |
  | [@tailwindcss/vite](https://tailwindcss.com) ([source](https://redirect.github.com/tailwindlabs/tailwindcss/tree/HEAD/packages/@tailwindcss-vite))                                             | [`^4.1.17` -> `^4.1.18`](https://renovatebot.com/diffs/npm/@tailwindcss%2fvite/4.1.17/4.1.18)        | [![age](https://developer.mend.io/api/mc/badges/age/npm/@tailwindcss%2fvite/4.1.18?slim=true)](https://docs.renovatebot.com/merge-confidence/)           | [![confidence](https://developer.mend.io/api/mc/badges/confidence/npm/@tailwindcss%2fvite/4.1.17/4.1.18?slim=true)](https://docs.renovatebot.com/merge-confidence/)          |
  | [@types/node](https://redirect.github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/node) ([source](https://redirect.github.com/DefinitelyTyped/DefinitelyTyped/tree/HEAD/types/node)) | [`^22` -> `^22.19.3`](https://renovatebot.com/diffs/npm/@types%2fnode/22.18.8/22.19.3)               | [![age](https://developer.mend.io/api/mc/badges/age/npm/@types%2fnode/22.19.3?slim=true)](https://docs.renovatebot.com/merge-confidence/)                | [![confidence](https://developer.mend.io/api/mc/badges/confidence/npm/@types%2fnode/22.18.8/22.19.3?slim=true)](https://docs.renovatebot.com/merge-confidence/)              |
  | [@vitest/browser](https://redirect.github.com/vitest-dev/vitest/tree/main/packages/browser#readme) ([source](https://redirect.github.com/vitest-dev/vitest/tree/HEAD/packages/browser))        | [`^3.2.3` -> `^3.2.4`](https://renovatebot.com/diffs/npm/@vitest%2fbrowser/3.2.4/3.2.4)              | [![age](https://developer.mend.io/api/mc/badges/age/npm/@vitest%2fbrowser/3.2.4?slim=true)](https://docs.renovatebot.com/merge-confidence/)              | [![confidence](https://developer.mend.io/api/mc/badges/confidence/npm/@vitest%2fbrowser/3.2.4/3.2.4?slim=true)](https://docs.renovatebot.com/merge-confidence/)              |
  | [eslint](https://eslint.org) ([source](https://redirect.github.com/eslint/eslint))                                                                                                             | [`^9.39.1` -> `^9.39.2`](https://renovatebot.com/diffs/npm/eslint/9.39.1/9.39.2)                     | [![age](https://developer.mend.io/api/mc/badges/age/npm/eslint/9.39.2?slim=true)](https://docs.renovatebot.com/merge-confidence/)                        | [![confidence](https://developer.mend.io/api/mc/badges/confidence/npm/eslint/9.39.1/9.39.2?slim=true)](https://docs.renovatebot.com/merge-confidence/)                       |
  | [eslint-plugin-svelte](https://sveltejs.github.io/eslint-plugin-svelte) ([source](https://redirect.github.com/sveltejs/eslint-plugin-svelte/tree/HEAD/packages/eslint-plugin-svelte))          | [`^3.13.0` -> `^3.13.1`](https://renovatebot.com/diffs/npm/eslint-plugin-svelte/3.13.0/3.13.1)       | [![age](https://developer.mend.io/api/mc/badges/age/npm/eslint-plugin-svelte/3.13.1?slim=true)](https://docs.renovatebot.com/merge-confidence/)          | [![confidence](https://developer.mend.io/api/mc/badges/confidence/npm/eslint-plugin-svelte/3.13.0/3.13.1?slim=true)](https://docs.renovatebot.com/merge-confidence/)         |
  | [eslint-plugin-yml](https://ota-meshi.github.io/eslint-plugin-yml/) ([source](https://redirect.github.com/ota-meshi/eslint-plugin-yml))                                                        | [`^1.18.0` -> `^1.19.1`](https://renovatebot.com/diffs/npm/eslint-plugin-yml/1.19.0/1.19.1)          | [![age](https://developer.mend.io/api/mc/badges/age/npm/eslint-plugin-yml/1.19.1?slim=true)](https://docs.renovatebot.com/merge-confidence/)             | [![confidence](https://developer.mend.io/api/mc/badges/confidence/npm/eslint-plugin-yml/1.19.0/1.19.1?slim=true)](https://docs.renovatebot.com/merge-confidence/)            |
  | [prettier](https://prettier.io) ([source](https://redirect.github.com/prettier/prettier))                                                                                                      | [`^3.6.2` -> `^3.7.4`](https://renovatebot.com/diffs/npm/prettier/3.6.2/3.7.4)                       | [![age](https://developer.mend.io/api/mc/badges/age/npm/prettier/3.7.4?slim=true)](https://docs.renovatebot.com/merge-confidence/)                       | [![confidence](https://developer.mend.io/api/mc/badges/confidence/npm/prettier/3.6.2/3.7.4?slim=true)](https://docs.renovatebot.com/merge-confidence/)                       |
  | [prettier-plugin-svelte](https://redirect.github.com/sveltejs/prettier-plugin-svelte)                                                                                                          | [`^3.4.0` -> `^3.4.1`](https://renovatebot.com/diffs/npm/prettier-plugin-svelte/3.4.0/3.4.1)         | [![age](https://developer.mend.io/api/mc/badges/age/npm/prettier-plugin-svelte/3.4.1?slim=true)](https://docs.renovatebot.com/merge-confidence/)         | [![confidence](https://developer.mend.io/api/mc/badges/confidence/npm/prettier-plugin-svelte/3.4.0/3.4.1?slim=true)](https://docs.renovatebot.com/merge-confidence/)         |
  | [prettier-plugin-tailwindcss](https://redirect.github.com/tailwindlabs/prettier-plugin-tailwindcss)                                                                                            | [`^0.7.1` -> `^0.7.2`](https://renovatebot.com/diffs/npm/prettier-plugin-tailwindcss/0.7.1/0.7.2)    | [![age](https://developer.mend.io/api/mc/badges/age/npm/prettier-plugin-tailwindcss/0.7.2?slim=true)](https://docs.renovatebot.com/merge-confidence/)    | [![confidence](https://developer.mend.io/api/mc/badges/confidence/npm/prettier-plugin-tailwindcss/0.7.1/0.7.2?slim=true)](https://docs.renovatebot.com/merge-confidence/)    |
  | [publint](https://publint.dev) ([source](https://redirect.github.com/publint/publint/tree/HEAD/packages/publint))                                                                              | [`^0.3.15` -> `^0.3.16`](https://renovatebot.com/diffs/npm/publint/0.3.15/0.3.16)                    | [![age](https://developer.mend.io/api/mc/badges/age/npm/publint/0.3.16?slim=true)](https://docs.renovatebot.com/merge-confidence/)                       | [![confidence](https://developer.mend.io/api/mc/badges/confidence/npm/publint/0.3.15/0.3.16?slim=true)](https://docs.renovatebot.com/merge-confidence/)                      |
  | [sass-embedded](https://redirect.github.com/sass/embedded-host-node)                                                                                                                           | [`^1.93.3` -> `^1.97.1`](https://renovatebot.com/diffs/npm/sass-embedded/1.93.3/1.97.1)              | [![age](https://developer.mend.io/api/mc/badges/age/npm/sass-embedded/1.97.1?slim=true)](https://docs.renovatebot.com/merge-confidence/)                 | [![confidence](https://developer.mend.io/api/mc/badges/confidence/npm/sass-embedded/1.93.3/1.97.1?slim=true)](https://docs.renovatebot.com/merge-confidence/)                |
  | [svelte](https://svelte.dev) ([source](https://redirect.github.com/sveltejs/svelte/tree/HEAD/packages/svelte))                                                                                 | [`^5.0.0` -> `^5.46.1`](https://renovatebot.com/diffs/npm/svelte/5.0.0/5.46.1)                       | [![age](https://developer.mend.io/api/mc/badges/age/npm/svelte/5.46.1?slim=true)](https://docs.renovatebot.com/merge-confidence/)                        | [![confidence](https://developer.mend.io/api/mc/badges/confidence/npm/svelte/5.0.0/5.46.1?slim=true)](https://docs.renovatebot.com/merge-confidence/)                        |
  | [svelte](https://svelte.dev) ([source](https://redirect.github.com/sveltejs/svelte/tree/HEAD/packages/svelte))                                                                                 | [`^5.43.8` -> `^5.46.1`](https://renovatebot.com/diffs/npm/svelte/5.45.2/5.46.1)                     | [![age](https://developer.mend.io/api/mc/badges/age/npm/svelte/5.46.1?slim=true)](https://docs.renovatebot.com/merge-confidence/)                        | [![confidence](https://developer.mend.io/api/mc/badges/confidence/npm/svelte/5.45.2/5.46.1?slim=true)](https://docs.renovatebot.com/merge-confidence/)                       |
  | [svelte-check](https://redirect.github.com/sveltejs/language-tools)                                                                                                                            | [`^4.3.4` -> `^4.3.5`](https://renovatebot.com/diffs/npm/svelte-check/4.3.4/4.3.5)                   | [![age](https://developer.mend.io/api/mc/badges/age/npm/svelte-check/4.3.5?slim=true)](https://docs.renovatebot.com/merge-confidence/)                   | [![confidence](https://developer.mend.io/api/mc/badges/confidence/npm/svelte-check/4.3.4/4.3.5?slim=true)](https://docs.renovatebot.com/merge-confidence/)                   |
  | [tailwindcss](https://tailwindcss.com) ([source](https://redirect.github.com/tailwindlabs/tailwindcss/tree/HEAD/packages/tailwindcss))                                                         | [`^4.1.17` -> `^4.1.18`](https://renovatebot.com/diffs/npm/tailwindcss/4.1.17/4.1.18)                | [![age](https://developer.mend.io/api/mc/badges/age/npm/tailwindcss/4.1.18?slim=true)](https://docs.renovatebot.com/merge-confidence/)                   | [![confidence](https://developer.mend.io/api/mc/badges/confidence/npm/tailwindcss/4.1.17/4.1.18?slim=true)](https://docs.renovatebot.com/merge-confidence/)                  |
  | [typescript-eslint](https://typescript-eslint.io/packages/typescript-eslint) ([source](https://redirect.github.com/typescript-eslint/typescript-eslint/tree/HEAD/packages/typescript-eslint))  | [`^8.47.0` -> `^8.50.1`](https://renovatebot.com/diffs/npm/typescript-eslint/8.48.0/8.50.1)          | [![age](https://developer.mend.io/api/mc/badges/age/npm/typescript-eslint/8.50.1?slim=true)](https://docs.renovatebot.com/merge-confidence/)             | [![confidence](https://developer.mend.io/api/mc/badges/confidence/npm/typescript-eslint/8.48.0/8.50.1?slim=true)](https://docs.renovatebot.com/merge-confidence/)            |
  | [vite](https://vite.dev) ([source](https://redirect.github.com/vitejs/vite/tree/HEAD/packages/vite))                                                                                           | [`^7.2.2` -> `^7.3.0`](https://renovatebot.com/diffs/npm/vite/7.2.4/7.3.0)                           | [![age](https://developer.mend.io/api/mc/badges/age/npm/vite/7.3.0?slim=true)](https://docs.renovatebot.com/merge-confidence/)                           | [![confidence](https://developer.mend.io/api/mc/badges/confidence/npm/vite/7.2.4/7.3.0?slim=true)](https://docs.renovatebot.com/merge-confidence/)                           |
  | [vitest](https://vitest.dev) ([source](https://redirect.github.com/vitest-dev/vitest/tree/HEAD/packages/vitest))                                                                               | [`^3.2.3` -> `^3.2.4`](https://renovatebot.com/diffs/npm/vitest/3.2.4/3.2.4)                         | [![age](https://developer.mend.io/api/mc/badges/age/npm/vitest/3.2.4?slim=true)](https://docs.renovatebot.com/merge-confidence/)                         | [![confidence](https://developer.mend.io/api/mc/badges/confidence/npm/vitest/3.2.4/3.2.4?slim=true)](https://docs.renovatebot.com/merge-confidence/)                         |
  | [wrangler](https://redirect.github.com/cloudflare/workers-sdk) ([source](https://redirect.github.com/cloudflare/workers-sdk/tree/HEAD/packages/wrangler))                                      | [`^4.51.0` -> `^4.54.0`](https://renovatebot.com/diffs/npm/wrangler/4.51.0/4.54.0)                   | [![age](https://developer.mend.io/api/mc/badges/age/npm/wrangler/4.54.0?slim=true)](https://docs.renovatebot.com/merge-confidence/)                      | [![confidence](https://developer.mend.io/api/mc/badges/confidence/npm/wrangler/4.51.0/4.54.0?slim=true)](https://docs.renovatebot.com/merge-confidence/)                     |
  | [yaml-eslint-parser](https://redirect.github.com/ota-meshi/yaml-eslint-parser)                                                                                                                 | [`^1.3.1` -> `^1.3.2`](https://renovatebot.com/diffs/npm/yaml-eslint-parser/1.3.1/1.3.2)             | [![age](https://developer.mend.io/api/mc/badges/age/npm/yaml-eslint-parser/1.3.2?slim=true)](https://docs.renovatebot.com/merge-confidence/)             | [![confidence](https://developer.mend.io/api/mc/badges/confidence/npm/yaml-eslint-parser/1.3.1/1.3.2?slim=true)](https://docs.renovatebot.com/merge-confidence/)             |

## 3.0.0

### Major Changes

- a103778: # Remove actions from node snippet

  Remove CRUD helper actions from being spread onto the node-snippet and supply them via simple imports. Because of the tree component's children only have access to their own tree and it's children, updating a parent node from a child node is not possible. The only way to handle this in a clean fashion is to provide the CRUD functions directly.

## 2.0.0

### Major Changes

- 2dbbc61: # Update Tree API
  - Remove export of utility functions from `tree.utils`
  - Update, Insert and Delete functions now work by reference. We do not want to create a new tree every time

## 1.1.1

### Patch Changes

- 1734920: Fix the release script

## 1.1.0

### Minor Changes

- a55493c: # Release Notes

  ## Update Docs
  - `README.md` now reflects latest changes

- 892ddd9: # Release Notes
  - Update structure
    - Tests are now separate from the lib folder
    - Make usage of `svelte-lib-helpers`

## 1.0.0

### Major Changes

- 8044f74: # Migrate Accordion to Tree component

### Improve Tree component api to allow for more flexibillity

- Rename `Accordion` component to `Tree` component
- Add props to allow styling and controlling the node wrapper
- Rename types to be in line with tree terminology

### Update Path & Minor

| Package                                                                                                                                                                   | Type            | Update | Change                                                                                             | Pending  |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | ------ | -------------------------------------------------------------------------------------------------- | -------- |
| [@sveltejs/adapter-cloudflare](https://svelte.dev/docs/kit/adapter-cloudflare) ([source](https://redirect.github.com/sveltejs/kit/tree/HEAD/packages/adapter-cloudflare)) | devDependencies | patch  | [`7.2.3` -> `7.2.4`](https://renovatebot.com/diffs/npm/@sveltejs%2fadapter-cloudflare/7.2.3/7.2.4) |          |
| [@sveltejs/adapter-node](https://svelte.dev/docs/kit/adapter-node) ([source](https://redirect.github.com/sveltejs/kit/tree/HEAD/packages/adapter-node))                   | devDependencies | patch  | [`5.3.2` -> `5.3.3`](https://renovatebot.com/diffs/npm/@sveltejs%2fadapter-node/5.3.2/5.3.3)       |          |
| [eslint-plugin-yml](https://ota-meshi.github.io/eslint-plugin-yml/) ([source](https://redirect.github.com/ota-meshi/eslint-plugin-yml))                                   | devDependencies | minor  | [`1.18.0` -> `1.19.0`](https://renovatebot.com/diffs/npm/eslint-plugin-yml/1.18.0/1.19.0)          |          |
| [vite](https://vite.dev) ([source](https://redirect.github.com/vitejs/vite/tree/HEAD/packages/vite))                                                                      | devDependencies | patch  | [`7.1.8` -> `7.1.9`](https://renovatebot.com/diffs/npm/vite/7.1.8/7.1.9)                           |          |
| [wrangler](https://redirect.github.com/cloudflare/workers-sdk) ([source](https://redirect.github.com/cloudflare/workers-sdk/tree/HEAD/packages/wrangler))                 | devDependencies | minor  | [`4.40.3` -> `4.41.0`](https://renovatebot.com/diffs/npm/wrangler/4.40.3/4.41.0)                   | `4.42.0` |

## 0.0.4

### Patch Changes

- ff5c6b5: # Update Documentation
  - Include a roadmap for future components and utilities

## 0.0.3

### Patch Changes

- 26e83ad: # Release Management

  Add a small release-management feature and workflow improvements for the Ember component library.

  What changed
  - Add basic Release Management tooling and documentation to help create and track releases.
  - Wire up changeset metadata so releases include a short release note and package bump.
  - Small, non-breaking API additions to `src/lib/ember/index.ts` to support release metadata (consumer-facing impact is minimal).

  Notes for consumers
  - This is a patch release with no breaking changes. Consumers do not need to change how they import or use components.
  - If you publish packages from this repo, you should see improved changelog/release notes generated automatically.

  If you need more details about the implementation or want this split into separate package bumps, open an issue or PR on the repo.
