<script lang="ts">
	import Highlight from 'svelte-highlight';
	import typescript from 'svelte-highlight/languages/typescript';
	import github from 'svelte-highlight/styles/github';

	import { TreeView } from '#lib';

	import { MOCK_CODE_STRING, MOCK_TREE } from '../__mock__/data';
	import { insertNode, patchNode, removeNode } from '../lib/tree/data';
	import type { TreeData } from '../lib/tree/tree.types';

	let tree = $state.raw<TreeData<{ name: string }>>(MOCK_TREE);
	let expandedIds = $state<string[]>([]);
	let selectedIds = $state<string[]>([]);
	let action = $state('insert');

	function apply(id: string) {
		if (action === 'insert') {
			tree = insertNode({
				tree,
				parentId: id,
				node: { id: crypto.randomUUID(), name: 'New node' }
			});
			if (!expandedIds.includes(id)) expandedIds = [...expandedIds, id];
		} else if (action === 'update') {
			tree = patchNode({ tree, id, patch: { name: 'Updated node' } });
		} else {
			tree = removeNode({ tree, id }).tree;
		}
	}
</script>

<svelte:head>
	<title>Ember — controlled trees for Svelte</title>
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html github}
</svelte:head>

<h1 class="mb-4 text-4xl">Ember</h1>
<p class="mb-4">
	Headless Svelte trees with controlled selection, keyboard navigation and
	immutable data utilities.
</p>
<p class="mb-4">
	Use arrow keys to navigate and expand, Home/End to move, and Enter or Space to
	select. Data remains separate from expansion and selection.
</p>
<label class="mb-4 block">
	Node action
	<select bind:value={action} class="ml-2 rounded border p-2">
		<option value="insert">Insert child</option>
		<option value="update">Rename</option>
		<option value="delete">Delete subtree</option>
	</select>
</label>
<TreeView
	{tree}
	label="Example collections"
	bind:expandedIds
	bind:selectedIds
	getLabel={(node) => node.name}
>
	{#snippet node(value, context)}
		<div
			class="my-1 flex items-center gap-2 rounded border p-2"
			class:bg-blue-100={context.selected}
			style:margin-left={`${context.depth * 20}px`}
		>
			{#if context.hasChildren}
				<button
					tabindex="-1"
					aria-label={`Toggle ${value.name}`}
					aria-expanded={context.expanded}
					onclick={context.toggle}
					class="rounded border px-2">{context.expanded ? '−' : '+'}</button
				>
			{/if}
			<button tabindex="-1" onclick={context.activate} class="flex-1 text-left"
				>{value.name}</button
			>
			<button onclick={() => apply(value.id)} class="rounded border px-2"
				>{action}</button
			>
		</div>
	{/snippet}
</TreeView>
<p class="my-4" aria-live="polite">
	Selected: {selectedIds.join(', ') || 'None'}
</p>
<button
	class="mb-6 rounded border p-2"
	onclick={() => {
		tree = MOCK_TREE;
		expandedIds = [];
		selectedIds = [];
	}}>Reset example</button
>
<h2 class="mb-2 text-2xl">Usage</h2>
<Highlight language={typescript} code={MOCK_CODE_STRING} />
<p class="mt-6">
	The data-only <code>@dle.dev/ember/tree</code> entry point exposes immutable CRUD,
	moves, validated indexes and flat/nested-array conversions. Indexing costs O(N);
	indexed reads avoid repeated tree searches.
</p>
<a class="mt-4 block underline" href="https://github.com/dle-labs/ember"
	>API documentation and source</a
>
