import { describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';

import EmptyIdHarness from './empty-id-harness.svelte';
import Harness from './harness.svelte';

describe('controlled indexed TreeView', () => {
	it('preserves input identity, expands disabled parents and selects nested nodes', async () => {
		render(Harness);
		await expect
			.element(page.getByTestId('identity'))
			.toHaveTextContent('same');
		(
			page
				.getByRole('button', { name: 'Select parent', exact: true })
				.element() as HTMLElement
		).click();
		await expect.element(page.getByTestId('selected')).toHaveTextContent('');
		await page.getByRole('button', { name: 'Toggle parent' }).click();
		await page
			.getByRole('button', { name: 'Select child', exact: true })
			.click();
		await expect
			.element(page.getByTestId('selected'))
			.toHaveTextContent('child');
		await expect
			.element(page.getByRole('treeitem', { name: 'Child', exact: true }))
			.toHaveAttribute('aria-level', '2');
		await expect
			.element(page.getByTestId('identity'))
			.toHaveTextContent('same');
	});

	it('reveals active ancestors once and allows manual collapse', async () => {
		render(Harness);
		await page.getByRole('button', { name: 'Reveal', exact: true }).click();
		await expect
			.element(page.getByRole('treeitem', { name: 'Leaf', exact: true }))
			.toBeInTheDocument();
		await page.getByRole('button', { name: 'Toggle parent' }).click();
		await expect
			.element(page.getByRole('treeitem', { name: 'Leaf', exact: true }))
			.not.toBeInTheDocument();
	});

	it('supports roving keyboard focus, collapse recovery and immutable deletion', async () => {
		render(Harness);
		const parent = page.getByRole('treeitem', { name: 'Parent', exact: true });
		(parent.element() as HTMLElement).focus();
		await userEvent.keyboard('{ArrowRight}{ArrowDown}');
		await expect
			.element(page.getByRole('treeitem', { name: 'Child', exact: true }))
			.toHaveFocus();
		await userEvent.keyboard('{ArrowRight}{ArrowDown}');
		await expect
			.element(page.getByRole('treeitem', { name: 'Leaf', exact: true }))
			.toHaveFocus();
		await userEvent.keyboard('{Home}');
		await expect.element(parent).toHaveFocus();
		await userEvent.keyboard('o');
		await expect
			.element(page.getByRole('treeitem', { name: 'Other', exact: true }))
			.toHaveFocus();
		await page.getByRole('button', { name: 'Refresh', exact: true }).click();
		await expect.element(parent).toHaveAttribute('tabindex', '-1');
		await expect
			.element(page.getByRole('treeitem', { name: 'Other', exact: true }))
			.toHaveAttribute('tabindex', '0');
	});
});

it('forwards legacy transition params and wrappers through recursive levels', async () => {
	const LegacyHarness = (await import('./legacy-harness.svelte')).default;
	const calls: unknown[] = [];
	render(LegacyHarness, { calls });
	await page.getByRole('button', { name: 'Open child' }).click();
	await expect
		.element(page.getByText('leaf', { exact: true }))
		.toBeInTheDocument();
	await expect.poll(() => calls.length).toBeGreaterThan(0);
	expect(
		calls.every((params) => (params as { duration: number }).duration === 1)
	).toBe(true);
	expect(page.getByTestId('transition-wrapper').all().length).toBe(2);
});

it('recovers actual focus to the surviving ancestor after collapse and deletion', async () => {
	render(Harness);
	await page.getByRole('button', { name: 'Reveal', exact: true }).click();
	const leaf = page.getByRole('treeitem', { name: 'Leaf', exact: true });
	(leaf.element() as HTMLElement).focus();
	await page.getByRole('button', { name: 'Collapse all', exact: true }).click();
	await expect
		.element(page.getByRole('treeitem', { name: 'Parent', exact: true }))
		.toHaveFocus();
	await page.getByRole('button', { name: 'Toggle parent' }).click();
	await page.getByRole('button', { name: 'Toggle child' }).click();
	(
		page
			.getByRole('treeitem', { name: 'Leaf', exact: true })
			.element() as HTMLElement
	).focus();
	await page.getByRole('button', { name: 'Refresh', exact: true }).click();
	await expect
		.element(page.getByRole('treeitem', { name: 'Parent', exact: true }))
		.toHaveFocus();
});

it('prunes removed controlled IDs and recovers focus when all rows disappear', async () => {
	render(Harness);
	await page.getByRole('button', { name: 'Reveal', exact: true }).click();
	await page.getByRole('button', { name: 'Select leaf', exact: true }).click();
	(
		page
			.getByRole('treeitem', { name: 'Leaf', exact: true })
			.element() as HTMLElement
	).focus();
	await page.getByRole('button', { name: 'Empty', exact: true }).click();
	await expect
		.element(page.getByRole('tree', { name: 'Example' }))
		.toHaveFocus();
	await expect.element(page.getByTestId('selected')).toHaveTextContent('');
	await expect.element(page.getByTestId('expanded')).toHaveTextContent('');
});

it.each(['Collapse all', 'Refresh'])(
	'recovers focus from embedded snippet controls after %s',
	async (action) => {
		render(Harness);
		await page.getByRole('button', { name: 'Reveal', exact: true }).click();
		await page.getByRole('textbox', { name: 'Edit leaf', exact: true }).click();
		await expect
			.element(page.getByRole('textbox', { name: 'Edit leaf', exact: true }))
			.toHaveFocus();
		await page.getByRole('button', { name: action, exact: true }).click();
		await expect
			.element(page.getByRole('treeitem', { name: 'Parent', exact: true }))
			.toHaveFocus();
	}
);

it('optionally clears single selection through snippet and keyboard activation', async () => {
	render(Harness, { deselectable: true });
	const select = page.getByRole('button', {
		name: 'Select other',
		exact: true
	});
	await select.click();
	await expect.element(page.getByTestId('selected')).toHaveTextContent('other');
	await select.click();
	await expect.element(page.getByTestId('selected')).toHaveTextContent('');
	(
		page
			.getByRole('treeitem', { name: 'Other', exact: true })
			.element() as HTMLElement
	).focus();
	await userEvent.keyboard('{Enter}');
	await expect.element(page.getByTestId('selected')).toHaveTextContent('other');
	await userEvent.keyboard(' ');
	await expect.element(page.getByTestId('selected')).toHaveTextContent('');
});

it('keeps single selection selected by default after repeated activation', async () => {
	render(Harness);
	const select = page.getByRole('button', {
		name: 'Select other',
		exact: true
	});
	await select.click();
	await select.click();
	await expect.element(page.getByTestId('selected')).toHaveTextContent('other');
});

it('hands pointer activation and toggling back to tree keyboard navigation', async () => {
	render(Harness);
	const parent = page.getByRole('treeitem', { name: 'Parent', exact: true });
	const child = page.getByRole('treeitem', { name: 'Child', exact: true });
	const other = page.getByRole('treeitem', { name: 'Other', exact: true });
	await page
		.getByRole('button', { name: 'Toggle parent', exact: true })
		.click();
	await expect.element(parent).toHaveFocus();
	await userEvent.keyboard('{ArrowDown}');
	await expect.element(child).toHaveFocus();
	await page.getByRole('button', { name: 'Select child', exact: true }).click();
	await expect.element(child).toHaveFocus();
	await userEvent.keyboard('{ArrowRight}{ArrowRight}');
	await expect
		.element(page.getByRole('treeitem', { name: 'Leaf', exact: true }))
		.toHaveFocus();
	await userEvent.keyboard('{ArrowLeft}');
	await expect.element(child).toHaveFocus();
	await userEvent.keyboard('{End}');
	await expect.element(other).toHaveFocus();
	await userEvent.keyboard('{Home}');
	await expect.element(parent).toHaveFocus();
	await userEvent.keyboard('o');
	await expect.element(other).toHaveFocus();
});

it('leaves independent snippet inputs in control of their keyboard events', async () => {
	render(Harness);
	const input = page.getByRole('textbox', { name: 'Edit other', exact: true });
	await input.click();
	await userEvent.keyboard('p{ArrowLeft}{Home}{End}{ArrowUp}');
	await expect.element(input).toHaveFocus();
	await expect.element(input).toHaveValue('p');
});

it('navigates to empty IDs and recovers focus to an empty ancestor', async () => {
	render(EmptyIdHarness, {
		initialTree: {
			'': {
				id: '',
				name: 'Zero',
				children: { child: { id: 'child', name: 'Child' } }
			},
			other: { id: 'other', name: 'Other' }
		},
		removeId: 'other'
	});
	const empty = page.getByRole('treeitem', { name: 'Zero', exact: true });
	const other = page.getByRole('treeitem', { name: 'Other', exact: true });
	(other.element() as HTMLElement).focus();
	await userEvent.keyboard('{ArrowUp}');
	await expect.element(empty).toHaveFocus();
	await userEvent.keyboard('{End}{Home}');
	await expect.element(empty).toHaveFocus();
	await userEvent.keyboard('{End}z');
	await expect.element(empty).toHaveFocus();
	await userEvent.keyboard('{ArrowRight}{ArrowRight}{ArrowLeft}');
	await expect.element(empty).toHaveFocus();
	await userEvent.keyboard('{ArrowRight}');
	await expect
		.element(page.getByRole('treeitem', { name: 'Child', exact: true }))
		.toHaveFocus();
	await page.getByRole('button', { name: 'Collapse', exact: true }).click();
	await expect.element(empty).toHaveFocus();
	await userEvent.keyboard('{End}');
	await page.getByRole('button', { name: 'Remove node', exact: true }).click();
	await expect.element(empty).toHaveFocus();
});

it('reveals an empty active ID and recovers focus when that ID is removed', async () => {
	render(EmptyIdHarness, {
		initialTree: {
			parent: {
				id: 'parent',
				name: 'Parent',
				children: { '': { id: '', name: 'Empty child' } }
			}
		},
		activeId: '',
		removeId: ''
	});
	const empty = page.getByRole('treeitem', {
		name: 'Empty child',
		exact: true
	});
	await expect.element(empty).toBeInTheDocument();
	(empty.element() as HTMLElement).focus();
	await page.getByRole('button', { name: 'Remove node', exact: true }).click();
	await expect
		.element(page.getByRole('treeitem', { name: 'Parent', exact: true }))
		.toHaveFocus();
});
