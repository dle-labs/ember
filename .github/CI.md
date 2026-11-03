# CI workflows

Validation and web deployment jobs use `ubicloud-standard-2-ubuntu-2404`.
The Changeset job uses GitHub-hosted `ubuntu-24.04` because npm trusted
publishing does not support self-hosted runners. The Ubicloud GitHub App
must have access to this repository. Standard GitHub cache actions and the
pnpm store cache use Ubicloud's transparent cache when enabled there.

- **Pull Request:** `Verify` always reports a result. Source, dependency,
  test and configuration changes run lint, type checks and headless Chromium
  tests with one dependency installation. App/build/deployment changes also
  build the package and demo. Documentation and changeset-only PRs skip this
  work. Test-only changes skip the build and preview. Same-repository PRs
  deploy the already-built artifact as a Worker Preview named `pr-<number>`
  through the `STAGING` GitHub environment;
  successful deployments add the preview URL to the job summary and comment
  on the PR with the deployed revision. Fork PRs validate/build without deploying.
  Use `Verify` as the required
  branch-protection check in place of the former `Lint` and `Test` jobs.
- **Changeset:** relevant release metadata/tooling changes on `master`
  update the release PR or publish npm. Manual dispatch remains available.
- **Publish:** `v*` tags install and build once, deploy the production Worker through `PRODUCTION`,
  and attach source and package archives to the GitHub release. Packing
  skips lifecycle scripts because `pnpm build` already ran `prepack`.

The shared setup restores the lockfile-keyed pnpm store and installs with
`--frozen-lockfile --prefer-offline`. PR validation also caches Chromium
by OS, architecture and lockfile, and ESLint by dependency/configuration
hash plus commit. ESLint uses content-based invalidation after checkout.
Playwright still checks/installs system dependencies on cache hits.
The complete `.svelte-kit` directory is passed as a one-day artifact because
the generated Cloudflare worker imports sibling server output and manifest files.
Build output is not reused across commits.

PR runs cancel superseded runs; production and npm publishing do not.
The manual PR `force_deploy` input forces validation, build and deployment.
With the input disabled, manual runs use the path filter against the default
branch (or the preceding commit when already on that branch).

Validate workflow edits with actionlint (allow the Ubicloud runner label),
Prettier and representative path-filter cases. Measure cold and warm hosted
runs before claiming a runtime improvement; local checks cannot establish
runner provisioning, cache hit rates or deployment success.

## npm trusted publishing

Configure the trusted publisher for `@dle.dev/ember` on npm with GitHub owner
`dle-labs`, repository `ember`, workflow `changeset.yaml`, no environment name,
and publishing enabled. The workflow has `id-token: write` permission. Update
the npm setting after repository transfers; GitHub redirects do not update it.

The release script publishes before creating or pushing tags and supports
retrying an unpublished version whose tag already exists. It writes structured
`git-tag` events to `CHANGESETS_OUTPUT` for Changesets Action v2 after success.

A local dry run or mocked command check cannot verify npm's OIDC trust settings;
that requires a successful publish from the configured GitHub workflow.

## Cloudflare Workers

The demo deploys to the `ember` Worker with static assets from
`.svelte-kit/cloudflare`. Production uses `wrangler deploy`; PRs use
`wrangler preview --name pr-<number> --json`. The preview command is currently
open beta and requires Wrangler 4.135.0 or later. Its JSON `preview.urls` array
supplies the stable link used in PR comments. Manual runs use
`manual-<run-id>` so they cannot overwrite a PR preview.

`STAGING` and `PRODUCTION` are GitHub environments, not Wrangler environments.
Both need `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN`. Provision the
`ember` Worker first using an administrator, then give the deployment tokens
Workers **Editor** access scoped to that Worker. Creating a Worker requires
product-level Admin access. The old Pages token permission is insufficient.

The `previews` block declares preview settings separately from production.
The asset binding is supplied by Wrangler from the top-level `assets` config.
Preview URLs are public on `workers.dev`. Cloudflare Access can protect them
if required. Cloudflare automatically evicts the least recently deployed
preview when the account's per-Worker preview limit is reached.

### Cut over from Pages

1. Provision `ember` and configure the scoped tokens in both GitHub environments.
2. Validate a PR preview, including routes, static assets and tree interactions.
3. Build and deploy the reviewed revision with `pnpm build` followed by
   `pnpm exec wrangler deploy`. Check the production `workers.dev` URL.
4. Detach `ember.dle.dev` from the existing Pages project and attach it as the
   Worker's Custom Domain in the dashboard. This is an explicit production
   cutover; keep the Pages project available for rollback. Domain changes require
   Worker Editor plus Zone → Workers Routes → Write for `dle.dev`.
5. Verify `https://ember.dle.dev` before retiring the Pages project. To roll back,
   remove the Worker's Custom Domain and reconnect it to Pages.

Custom Domains are managed in the dashboard; `wrangler.jsonc` intentionally
omits `routes` so routine deployment tokens do not need zone permissions.
Keep that connection unchanged during routine deployments.

For local runtime checks, `pnpm preview:cf` builds and starts `wrangler dev`.
`pnpm exec wrangler deploy --dry-run` validates bundling without publishing.
These checks do not prove token permissions or a successful hosted deployment.

References: [Workers Previews](https://developers.cloudflare.com/workers/previews/)
and [Workers permissions](https://developers.cloudflare.com/workers/authorization/workers/).
