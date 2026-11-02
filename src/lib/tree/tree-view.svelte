<script lang="ts" generics="T extends object">
	import { tick, untrack } from 'svelte';

	import { createTreeIndex, flattenVisible } from './tree.data';
	import type { TreeViewProps } from './tree-view.types';

	let {
		tree,
		node,
		expandedIds = $bindable([]),
		selectedIds = $bindable([]),
		disabledIds = [],
		selection = 'single',
		deselectable = false,
		activeId = null,
		onActivate,
		label,
		getLabel = (value) => String(value.label ?? value.name ?? value.id)
	}: TreeViewProps<T> = $props();

	const index = $derived(createTreeIndex(tree));
	const expanded = $derived(new Set(expandedIds));
	const selected = $derived(new Set(selectedIds));
	const disabled = $derived(new Set(disabledIds));
	const rows = $derived(flattenVisible(index, expanded));
	const positions = $derived(
		new Map(rows.map((row, position) => [row.node.id, position]))
	);
	// DOM references are an imperative lookup, not rendered state.
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	const itemElements = new Map<string, HTMLElement>();
	let focusedId = $state<string | null>(null);
	let element: HTMLDivElement;
	let search = '';
	let lastSearch = 0;
	const tabStop = $derived(
		focusedId != null && positions.has(focusedId) ? focusedId : rows[0]?.node.id
	);

	// Deliberately exclude expansion from this effect: a manual collapse must
	// remain collapsed until the active item or the data revision changes.
	$effect(() => {
		const current = index;
		const active = activeId;
		untrack(() => {
			if (expandedIds.some((id) => !current.nodes.has(id)))
				expandedIds = expandedIds.filter((id) => current.nodes.has(id));
			if (selectedIds.some((id) => !current.nodes.has(id)))
				selectedIds = selectedIds.filter((id) => current.nodes.has(id));
			if (active == null || !current.nodes.has(active)) return;
			// This local snapshot is assigned back once after collecting ancestors.
			// eslint-disable-next-line svelte/prefer-svelte-reactivity
			const next = new Set(expandedIds);
			let parent = current.parents.get(active);
			while (parent != null) {
				next.add(parent);
				parent = current.parents.get(parent);
			}
			if (next.size !== expandedIds.length) expandedIds = [...next];
		});
	});

	let previousIndex: typeof index | undefined;
	let previousIds: string[] = [];
	$effect.pre(() => {
		const visible = rows;
		const current = index;
		const id = untrack(() => focusedId);
		if (id != null && !positions.has(id)) {
			let parent = previousIndex?.parents.get(id);
			while (parent != null && !positions.has(parent)) {
				parent = previousIndex?.parents.get(parent);
			}
			const position = Math.max(0, previousIds.indexOf(id));
			const target =
				parent ?? visible[Math.min(position, visible.length - 1)]?.node.id;
			const hadFocus = element?.contains(document.activeElement);
			focusedId = target ?? null;
			if (hadFocus) {
				if (target != null) focus(target);
				else void tick().then(() => element.focus());
			}
		}
		previousIndex = current;
		previousIds = visible.map((row) => row.node.id);
	});

	function focus(id: string) {
		focusedId = id;
		void tick().then(() => itemElements.get(id)?.focus());
	}

	function registerItem(item: HTMLElement, id: string) {
		itemElements.set(id, item);
		return {
			destroy: () => {
				itemElements.delete(id);
			}
		};
	}

	// Row-label and disclosure controls delegate interaction back to the tree.
	// Focus synchronously so an onActivate callback can still move focus elsewhere.
	function focusRow(id: string) {
		focusedId = id;
		itemElements.get(id)?.focus();
	}

	function toggle(id: string) {
		focusRow(id);
		if (!index.children.get(id)?.length) return;
		expandedIds = expanded.has(id)
			? expandedIds.filter((value) => value !== id)
			: [...expandedIds, id];
	}

	function activate(id: string) {
		focusRow(id);
		if (disabled.has(id)) return;
		if (selection === 'single')
			selectedIds = deselectable && selected.has(id) ? [] : [id];
		if (selection === 'multiple') {
			selectedIds = selected.has(id)
				? selectedIds.filter((value) => value !== id)
				: [...selectedIds, id];
		}
		onActivate?.(id);
	}

	function keydown(event: KeyboardEvent, id: string) {
		if (event.target !== event.currentTarget) return;
		const position = positions.get(id) ?? -1;
		let target: string | undefined;
		switch (event.key) {
			case 'ArrowDown':
				target = rows[position + 1]?.node.id;
				break;
			case 'ArrowUp':
				target = rows[position - 1]?.node.id;
				break;
			case 'Home':
				target = rows[0]?.node.id;
				break;
			case 'End':
				target = rows.at(-1)?.node.id;
				break;
			case 'ArrowRight':
				if (!expanded.has(id)) toggle(id);
				else target = index.children.get(id)?.[0];
				break;
			case 'ArrowLeft':
				if (expanded.has(id)) toggle(id);
				else target = index.parents.get(id) ?? undefined;
				break;
			case 'Enter':
			case ' ':
				activate(id);
				break;
			default:
				if (
					event.key.length !== 1 ||
					event.ctrlKey ||
					event.metaKey ||
					event.altKey
				)
					return;
				search = Date.now() - lastSearch > 500 ? event.key : search + event.key;
				lastSearch = Date.now();
				target = [
					...rows.slice(position + 1),
					...rows.slice(0, position + 1)
				].find((row) =>
					getLabel(row.node)
						.toLocaleLowerCase()
						.startsWith(search.toLocaleLowerCase())
				)?.node.id;
		}
		event.preventDefault();
		if (target != null) focus(target);
	}
</script>

<div
	bind:this={element}
	role="tree"
	tabindex={rows.length ? undefined : 0}
	aria-label={label}
	aria-multiselectable={selection === 'multiple' ? true : undefined}
>
	{#each rows as row (row.node.id)}
		{@const id = row.node.id}
		{@const hasChildren = !!index.children.get(id)?.length}
		<div
			role="treeitem"
			use:registerItem={id}
			data-tree-id={id}
			aria-label={getLabel(row.node)}
			aria-level={row.depth + 1}
			aria-posinset={row.posInSet}
			aria-setsize={row.setSize}
			aria-expanded={hasChildren ? expanded.has(id) : undefined}
			aria-selected={selection === 'none' ? undefined : selected.has(id)}
			aria-disabled={disabled.has(id) || undefined}
			tabindex={tabStop === id ? 0 : -1}
			onfocusin={() => {
				focusedId = id;
			}}
			onkeydown={(event) => keydown(event, id)}
			onclick={(event) => {
				if (event.target === event.currentTarget) activate(id);
			}}
		>
			{@render node(row.node, {
				depth: row.depth,
				expanded: expanded.has(id),
				selected: selected.has(id),
				disabled: disabled.has(id),
				hasChildren,
				active: activeId === id,
				toggle: () => toggle(id),
				activate: () => activate(id)
			})}
		</div>
	{/each}
</div>
