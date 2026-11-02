import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';

describe('/+page.svelte', () => {
	it('renders the controlled tree demo and immutable actions', async () => {
		const Page = (await import('./+page.svelte')).default;

		render(Page);

		// The page should render the main heading and a select for actions
		const heading = page.getByRole('heading', { name: /Ember/i });
		await expect.element(heading).toBeInTheDocument();

		const select = page.getByRole('combobox');
		await expect.element(select).toBeInTheDocument();
		await expect
			.element(page.getByRole('tree', { name: 'Example collections' }))
			.toBeInTheDocument();
	});
});
