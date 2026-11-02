<script lang="ts">
	import Tree from '../../lib/tree/tree.svelte';
	import type { TreeData } from '../../lib/tree/tree.types';

	let { calls = [] }: { calls?: unknown[] } = $props();
	let tree = $state<TreeData<{ id: string }>>({
		parent: {
			id: 'parent',
			expanded: true,
			children: {
				child: {
					id: 'child',
					expanded: false,
					children: {
						leaf: { id: 'leaf' }
					}
				}
			}
		}
	});
	const marker = { duration: 1 };
</script>

<button
	onclick={() => {
		tree.parent.children!.child.expanded = true;
	}}>Open child</button
>
<Tree
	bind:tree
	transition={(_element, params) => {
		calls.push(params);
		return { duration: 1 };
	}}
	transitionParams={marker}
	transitionWrapperProps={{ 'data-testid': 'transition-wrapper' }}
>
	{#snippet node(value)}<span>{String(value.id)}</span>{/snippet}
</Tree>
