<script lang="ts">
	import { untrack } from 'svelte';

	import { removeNode } from '../../lib/tree/tree.data';
	import type { TreeData } from '../../lib/tree/tree.types';
	import TreeView from '../../lib/tree/tree-view.svelte';

	let {
		initialTree,
		activeId = null,
		removeId
	}: {
		initialTree: TreeData;
		activeId?: string | null;
		removeId: string;
	} = $props();
	let tree = $state(untrack(() => initialTree));
	let expandedIds = $state<string[]>([]);
</script>

<TreeView {tree} {activeId} bind:expandedIds label="Empty IDs">
	{#snippet node(value, context)}
		<button tabindex={-1} onclick={context.activate}
			>{String(value.name)}</button
		>
	{/snippet}
</TreeView>
<button
	onmousedown={(event) => event.preventDefault()}
	onclick={() => {
		tree = removeNode({ tree, id: removeId }).tree;
	}}>Remove node</button
>
<button
	onmousedown={(event) => event.preventDefault()}
	onclick={() => {
		expandedIds = [];
	}}>Collapse</button
>
