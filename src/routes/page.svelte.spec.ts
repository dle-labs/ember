import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';

describe('/+page.svelte', () => {
	it('should render h1', async () => {
		// Provide a minimal $state stub before loading the component.
		// The component calls $state(...) at module initialization, so
		// we dynamically import the component after stubbing.
		// The stub simply returns the passed value which is sufficient
		// for this render-only test.
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		globalThis.$state = (v: unknown) => v;

		const Page = (await import('./+page.svelte')).default;

		render(Page);

		// The page should render the main heading and a select for actions
		const heading = page.getByRole('heading', { name: /Ember/i });
		await expect.element(heading).toBeInTheDocument();

		const select = page.getByRole('combobox');
		await expect.element(select).toBeInTheDocument();
	});
});
