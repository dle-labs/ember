import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';

describe('Accordion component (integration)', () => {
	it('renders nodes and supports toggle/insert/update/delete via actions', async () => {
		// Provide a minimal $state stub used by Accordion at module initialization
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		globalThis.$state = (v: unknown) => v;

		const Harness = (await import('./test-harness.spec.svelte')).default;

		// Import the mock tree synchronously so we can reference a known id
		const { MOCK_TREE } = await import('../../__mock__/data');
		const nodeId = Object.keys(MOCK_TREE)[0];

		render(Harness);

		// Wait for the node element to be present
		const node = page.getByTestId(`node-${nodeId}`);
		await expect.element(node).toBeInTheDocument();

		// Toggle should be present and clickable
		const toggle = page.getByTestId(`toggle-${nodeId}`);
		await expect.element(toggle).toBeInTheDocument();
		await toggle.click();

		// Insert a child under this node
		const insert = page.getByTestId(`insert-${nodeId}`);
		await insert.click();

		// The inserted child should now exist (test-harness uses id `${id}-new`)
		const inserted = page.getByTestId(`node-${nodeId}-new`);
		await expect.element(inserted).toBeInTheDocument();

		// Update the original node name
		const update = page.getByTestId(`update-${nodeId}`);
		await update.click();
		await expect.element(node).toBeInTheDocument();

		// Delete the inserted node via its delete button
		const deleteBtn = page.getByTestId(`delete-${nodeId}-new`);
		await expect.element(deleteBtn).toBeInTheDocument();
		await deleteBtn.click();

		// Trying to get the deleted node should throw (not found)
		let found = true;
		try {
			const node = page.getByTestId(`node-${nodeId}-new`);
			await expect.element(node).toBeInTheDocument();
		} catch {
			found = false;
		}
		expect(found).toBe(false);
	});
});
