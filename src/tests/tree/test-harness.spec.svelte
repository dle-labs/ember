<script lang="ts">
	import { deleteNode, insertNode, type Node, Tree, updateNode } from '#lib';

	import { MOCK_TREE } from '../../__mock__/data';

	// Use a plain mutable tree variable so tests can bind to it.
	// We deep-clone the mock to avoid shared mutation between tests.
	let tree = $state(structuredClone(MOCK_TREE));

	// The snippet receives content and exposes action buttons to drive
	// the node actions directly from tests via data-testid attributes.
	// This keeps the harness minimal while allowing deterministic tests.
</script>

{#snippet node(content: Node<object>)}
	<div data-testid={`node-${content.id}`} class="node">
		<button
			data-testid={`toggle-${content.id}`}
			onclick={() => {
				updateNode({
					node: {
						...content,
						expanded: !content.expanded
					},
					tree
				});
			}}
		>
			toggle
		</button>
		<span>{content.name}</span>

		<button
			data-testid={`insert-${content.id}`}
			onclick={() =>
				insertNode({
					node: {
						id: `${content.id}-new`,
						name: 'Inserted Node',
						children: {}
					},
					parent: content,
					tree
				})}
		>
			insert
		</button>

		<button
			data-testid={`update-${content.id}`}
			onclick={() =>
				updateNode({ node: { ...content, name: 'Updated Node' }, tree })}
		>
			update
		</button>

		<button
			data-testid={`delete-${content.id}`}
			onclick={() => deleteNode({ node: content, tree })}
		>
			delete
		</button>
	</div>
{/snippet}

<div class="accordion">
	<Tree {node} bind:tree />
</div>

<style>
	.accordion {
		border: 1px solid red;
		display: flex;
		flex-direction: row;
		row-gap: 1rem;
	}
	.node {
		border: 1px solid blue;
		padding: 0.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
</style>
