<script lang="ts">
	import { untrack } from 'svelte';

	import type { TreeData } from '../../lib/tree/tree.types';
	import TreeView from '../../lib/tree/tree-view.svelte';

	let { deselectable = false }: { deselectable?: boolean } = $props();
	let tree = $state<TreeData>({
		parent: {
			id: 'parent',
			name: 'Parent',
			children: {
				child: {
					id: 'child',
					name: 'Child',
					children: {
						leaf: { id: 'leaf', name: 'Leaf' }
					}
				}
			}
		},
		other: { id: 'other', name: 'Other' }
	});
	const original = untrack(() => tree);
	let expandedIds = $state<string[]>([]);
	let selectedIds = $state<string[]>([]);
	let activeId = $state<string | null>(null);
</script>

<button
	onclick={() => {
		activeId = 'leaf';
	}}>Reveal</button
>
<button
	onmousedown={(event) => event.preventDefault()}
	onclick={() => {
		tree = { parent: { id: 'parent', name: 'Parent' }, other: tree.other };
	}}>Refresh</button
>
<output data-testid="identity">{tree === original ? 'same' : 'changed'}</output>
<output data-testid="selected">{selectedIds.join(',')}</output>
<TreeView
	{deselectable}
	{tree}
	label="Example"
	bind:expandedIds
	bind:selectedIds
	{activeId}
	disabledIds={['parent']}
>
	{#snippet node(value, context)}
		{#if context.hasChildren}<button
				aria-disabled="false"
				aria-label={`Toggle ${value.id}`}
				tabindex={-1}
				onclick={context.toggle}>Toggle</button
			>{/if}
		<input aria-label={`Edit ${value.id}`} />
		<button
			tabindex={-1}
			aria-label={`Select ${value.id}`}
			onclick={context.activate}>{String(value.name)}</button
		>
	{/snippet}
</TreeView>

<button
	onmousedown={(event) => event.preventDefault()}
	onclick={() => {
		expandedIds = [];
	}}>Collapse all</button
>

<output data-testid="expanded">{expandedIds.join(',')}</output>
<button
	onmousedown={(event) => event.preventDefault()}
	onclick={() => {
		tree = {};
	}}>Empty</button
>
