import type { Snippet } from 'svelte';

import type { Node, TreeData } from './tree.types';

export type TreeNodeContext = {
	depth: number;
	expanded: boolean;
	selected: boolean;
	disabled: boolean;
	hasChildren: boolean;
	active: boolean;
	toggle: () => void;
	activate: () => void;
};

export type TreeViewProps<T extends object = object> = {
	tree: TreeData<T>;
	node: Snippet<[Node<T>, TreeNodeContext]>;
	expandedIds?: string[];
	selectedIds?: string[];
	disabledIds?: string[];
	selection?: 'none' | 'single' | 'multiple';
	/** Allow single selection to clear when activated again. Defaults to false. */
	deselectable?: boolean;
	activeId?: string | null;
	onActivate?: (id: string) => void;
	label: string;
	getLabel?: (node: Node<T>) => string;
};
