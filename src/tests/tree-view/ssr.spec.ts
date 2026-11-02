import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import Harness from './harness.svelte';
import LegacyHarness from './legacy-harness.svelte';

describe('tree SSR', () => {
	it('renders indexed rows and initial accessibility state on the server', () => {
		const html = render(Harness).body;
		expect(html).toContain('role="tree"');
		expect(html).toContain('aria-label="Parent"');
		expect(html).toContain('aria-expanded="false"');
		expect(html).toContain('same');
	});

	it('renders expanded legacy descendants before mounting', () => {
		const html = render(LegacyHarness).body;
		expect(html).toContain('parent');
		expect(html).toContain('child');
		expect(html).not.toContain('>leaf<');
	});
});
