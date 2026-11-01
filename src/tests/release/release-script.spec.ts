import { execFileSync } from 'child_process';
import { describe, expect, test } from 'vitest';

import { version } from '../../../package.json';

describe('release script', () => {
	test('emits the Changesets tag signal after publish', () => {
		const output = execFileSync(
			'node',
			['./.github/scripts/release.mts', '--dry-run'],
			{
				encoding: 'utf8',
				env: { ...process.env, DRY_RUN: '1' }
			}
		);

		expect(output).toContain(`New tag: v${version}`);
	});
});
