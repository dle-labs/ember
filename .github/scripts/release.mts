/**
 * release.mts
 *
 * Simple release helper that:
 *  - reads the current version from package.json
 *  - publishes the package if its version is not already on npm
 *  - creates and pushes the release tag after publication succeeds
 *  - reports the release through CHANGESETS_OUTPUT for Changesets Action v2
 *
 * Usage:
 *  node release.mts            # perform publish, tag, and push
 *  DRY_RUN=1 node release.mts  # print commands without running them
 *  node release.mts --dry-run  # same as DRY_RUN
 */

import { execSync } from 'child_process';
import { appendFile, readFile, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.dirname(fileURLToPath(import.meta.url));

const pkgPath = path.join(root, '../../', 'package.json');

const changesetsOutput = process.env.CHANGESETS_OUTPUT;

const dryRun =
	process.env.DRY_RUN === '1' || process.argv.includes('--dry-run');

function run(cmd: string, opts: Record<string, unknown> = {}): unknown {
	if (dryRun) {
		console.log(`[dry-run] ${cmd}`);
		return;
	}
	console.log(`> ${cmd}`);
	return execSync(cmd, { stdio: 'inherit', ...opts });
}

function commandSucceeds(cmd: string): boolean {
	try {
		execSync(cmd, { stdio: 'ignore' });
		return true;
	} catch {
		return false;
	}
}

try {
	const raw = await readFile(pkgPath, 'utf8');
	const pkg = JSON.parse(raw);
	const packageName = pkg && pkg.name;
	const version = pkg && pkg.version;
	if (!packageName) {
		console.error('package.json does not contain a name field');
		process.exit(1);
	}
	if (!version) {
		console.error('package.json does not contain a version field');
		process.exit(1);
	}

	const tag = `v${version}`;

	console.log(`Releasing version ${version}`);

	if (!dryRun && changesetsOutput) {
		await writeFile(changesetsOutput, '');
	}

	const packageVersionPublished =
		!dryRun && commandSucceeds(`npm view ${packageName}@${version} version`);
	const localTagExists =
		!dryRun && commandSucceeds(`git rev-parse -q --verify refs/tags/${tag}`);
	const remoteTagExists =
		!dryRun &&
		commandSucceeds(`git ls-remote --exit-code --tags origin refs/tags/${tag}`);
	const tagExists = localTagExists || remoteTagExists;

	if (packageVersionPublished && remoteTagExists) {
		console.log(`${packageName}@${version} is already published.`);
		console.log(`Tag ${tag} already exists; nothing to release.`);
		process.exit(0);
	}

	if (!dryRun) {
		if (packageVersionPublished) {
			console.log(`${packageName}@${version} is already published.`);
		}

		if (tagExists) {
			console.log(`Tag ${tag} already exists; skipping tag creation.`);
		}
	}

	if (!packageVersionPublished) {
		console.log('Running: npm publish --access public');
		run('npm publish --access public');
	}

	if (!tagExists) {
		console.log(`Creating git tag ${tag}`);
		run(`git tag -a ${tag} -m "${tag}"`);
	}

	if (!remoteTagExists) {
		console.log(`Pushing tag ${tag} to origin`);
		run(`git push origin ${tag}`);
	}

	if (remoteTagExists && !localTagExists) {
		// Changesets Action resolves the reported tag from the local checkout.
		run(`git fetch origin tag ${tag}`);
	}

	if (!dryRun && changesetsOutput) {
		await appendFile(
			changesetsOutput,
			JSON.stringify({ type: 'git-tag', tag, packageName }) + '\n'
		);
	}

	console.log('Release script finished.');
} catch (err) {
	console.error('Release failed:');
	console.error(err);
	process.exit(1);
}
