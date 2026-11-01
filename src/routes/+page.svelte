<svelte:options runes />

<script lang="ts">
	import clsx from 'clsx';
	import Highlight from 'svelte-highlight';
	import typescript from 'svelte-highlight/languages/typescript';
	import github from 'svelte-highlight/styles/github';

	import {
		deleteNode,
		insertNode,
		type Node,
		Tree,
		updateNode
	} from '#lib/tree/index.ts';

	import { MOCK_CODE_STRING, MOCK_TREE } from '../__mock__/data';

	let tree = $state(MOCK_TREE);
	let action = $state('delete');

	const exampleTree = `
/**
 * A node in the tree. Can have any extra properties
 */	
export type Node<T extends object = object> = T & {
	/*
	 * A unique identifier for the node. This is
	 * required to perform actions on the tree. If it
	 * is not unique, actions will not work as expected.
	 * Most implementations use arrays here and loop over everything
	 * to find the right node, but this implementation
	 * uses a record for O(1) access.
	 */
	id: string;
	/*
	 * This property gets tacked on to the tree
	 * which is passed in and lets you determine
	 * if a node is expanded in the node snippet
	 */
	expanded?: boolean; 
	/*
	 * Any other properties you want to add to the node
	 */
	[key: string | number]: unknown;
};
/**
 * A node which can have children
 */
export type Node<T extends object = object> = Node<T> & {
	children?: Record<string, Node<T>>;
};
/**
 * The complete accordion tree. This is a record of nodes with children
 */
export type Tree<T extends object = object> = Record<string, Node<T>>;
`;

	function copyToClipboard(anchor: string) {
		navigator.clipboard.writeText(`${window.location.origin}/#${anchor}`);
	}
</script>

<svelte:head>
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html github}
</svelte:head>

<div class="nodes-center mb-5 flex justify-baseline">
	<h1 class="text-4xl">Ember</h1>

	<img src="/favicon.svg" alt="Ember Logo" class="ml-2 h-9" />
	<a
		href="https://github.com/polaroidkidd/ember"
		target="_blank"
		rel="noreferrer"
		class="ml-auto"
	>
		<img
			class="mr-2 ml-4 h-6 w-6 rounded-4xl hover:bg-primary-200"
			src="/github.svg"
			alt="GitHub Logo"
		/>
	</a>
</div>
<h2 class="mb-10 text-2xl">A collection of headless svelte-5 components</h2>
<button
	type="button"
	onclick={() => copyToClipboard('nestable-accordion')}
	class="cursor-pointer hover:underline"
>
	<h3
		data-tooltip="Click to Copy"
		id="nestable-accordion"
		class={clsx('mb-2 text-xl')}
	>
		Nestable Accordion
	</h3>
</button>

<p class="mb-2">
	Most implementations use arrays here and loop over everything to find the
	right node, but this implementation uses a record for O(1) access. Use this
	implementation for example when you have to render a large and deeply nested
	file tree. Additionally this library provides insert, update and delete
	operations out of the box.
</p>

<p class="mb-2">The component expects two arguments</p>
<ol class="ml-12 list-outside list-decimal py-4">
	<li>A snippet, which renders each entry</li>
	<li>
		A tree structure which represents the nodes in the accordion. This has to be
		a binded state
	</li>
</ol>

<p class="mb-2">The tree structure it expects is as follows</p>

<div class="mt-10 mb-10 overflow-hidden rounded-md border shadow-2xl">
	<Highlight language={typescript} code={exampleTree} />
</div>
<p class="mb-2">
	The `node` snippet gets loaded with four helper methods. Update, Insert,
	Delete and Toggle
</p>
<ul class="mb-10 ml-12 list-outside list-disc py-4">
	<li>
		<i>Update</i> accepts a new node and will replace the current one in the tree
	</li>
	<li>
		<i>Delete</i> removes the current node and all it's children from the tree
	</li>
	<li>
		<i>Insert</i> accepts a new node and will add it as a child of the current node
	</li>
	<li><i>Toggle</i> toggles the expanded state of the current node</li>
</ul>

<p class="mb-2">
	All actions are performed on the tree and any changes are reflected
	immediatelly.
</p>
<h3 class="mb-5 text-xl">Example</h3>

<h3 class="mb-2">Select an action or toggle individual nodes</h3>
<select
	bind:value={action}
	class="mb-4 ml-2 rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
>
	<option value="delete">Delete</option>
	<option value="insert">Insert</option>
	<option value="update">Update</option>
</select>
<!-- The nodeProps type should contain the type definition of an individual node in the tree-->
{#snippet node(content: Node<{ name: string; id: string }>)}
	{@const disabled = !(
		content.children && Object.keys(content.children).length > 0
	)}
	<div
		class={clsx(
			'nodes-baseline mb-2 inline-flex',
			'justify-baseline  border',
			'border-primary-200 bg-primary-50 p-4',
			'align-baseline'
		)}
	>
		<button
			{disabled}
			type="button"
			class={clsx(
				'mr-2 rounded border',
				{
					' bg-primary-100 hover:bg-primary-200': !disabled,
					'cursor-not-allowed bg-gray-200': disabled,
					'cursor-pointer': !disabled
				},

				'px-2 ',
				'nodes-baseline flex justify-baseline'
			)}
			onclick={(e) => {
				e.preventDefault();
				updateNode({
					node: {
						...content,
						expanded: !content.expanded
					},
					tree
				});
			}}
		>
			<div
				class={clsx(
					'm-x-1 my-3 h-4 w-4  origin-center cursor-pointer transition-all',
					{
						'rotate-90': !disabled && content.expanded,
						'cursor-not-allowed': disabled
					}
				)}
			>
				<img
					src="/chevron.svg"
					alt="Chevron icon"
					class={clsx('h-4 w-4', { 'cursor-not-allowed': disabled })}
				/>
			</div>
		</button>
		<h1 class="my-auto">{content.name}</h1>

		<button
			class="ml-auto flex cursor-pointer flex-col rounded-sm border px-4 py-2 hover:bg-primary-100"
			type="button"
			onclick={() => {
				if (action === 'insert') {
					insertNode({
						node: {
							id: crypto.randomUUID(),
							name: 'New Node',
							children: {}
						},
						parent: content,
						tree
					});
				} else if (action === 'update') {
					updateNode({ node: { ...content, name: 'Updated Node' }, tree });
				} else if (action === 'delete') {
					deleteNode({ node: content, tree });
				}
			}}>{action}</button
		>
	</div>
{/snippet}

<Tree
	{node}
	bind:tree
	wrapperProps={{
		class: 'ml-6 grid'
	}}
	wrapperElement="span"
/>
<h3 class="mt-5 text-xl">Working Code</h3>
<div class="mt-10 overflow-hidden rounded-md border shadow-2xl">
	<Highlight language={typescript} code={MOCK_CODE_STRING} />
</div>

<style lang="postcss">
	[data-tooltip] {
		position: relative;
	}

	[data-tooltip]::after {
		position: absolute;
		opacity: 0;
		pointer-events: none;
		content: attr(data-tooltip);
		left: 2.25rem;
		top: -2.75rem;
		border-radius: 3px;
		box-shadow: 0 0 5px 2px rgba(100, 100, 100, 0.6);
		background-color: white;
		width: 8rem;
		font-size: small;
		z-index: 10;
		padding: 8px;

		transform: translateY(-20px);
		transition: all 150ms cubic-bezier(0.25, 0.8, 0.25, 1);
	}

	[data-tooltip]:hover::after {
		opacity: 1;
		transform: translateY(0);
		transition-duration: 300ms;
	}
</style>
