import type { Node, TreeData } from './tree.types';

export type TreeErrorCode =
	| 'INVALID_ID'
	| 'INVALID_STRUCTURE'
	| 'DUPLICATE_ID'
	| 'CYCLE'
	| 'ORPHAN'
	| 'NOT_FOUND'
	| 'INVALID_INDEX'
	| 'STALE_INDEX'
	| 'UNREPRESENTABLE_ORDER';
export class TreeError extends Error {
	constructor(
		public readonly code: TreeErrorCode,
		message: string
	) {
		super(message);
		this.name = 'TreeError';
	}
}
/** Reuse only while the source tree is unchanged; treat maps as read-only. */
export interface TreeIndex<T extends object = object> {
	readonly tree: TreeData<T>;
	readonly nodes: ReadonlyMap<string, Node<T>>;
	readonly parents: ReadonlyMap<string, string | null>;
	readonly children: ReadonlyMap<string | null, readonly string[]>;
}
function fail(code: TreeErrorCode, message: string): never {
	throw new TreeError(code, message);
}
const record = <T>(): Record<string, T> =>
	Object.create(null) as Record<string, T>;
export function createTreeIndex<T extends object>(
	tree: TreeData<T>
): TreeIndex<T> {
	const nodes = new Map<string, Node<T>>(),
		parents = new Map<string, string | null>(),
		children = new Map<string | null, string[]>();
	const stack: { map: TreeData<T>; parent: string | null }[] = [
		{ map: tree, parent: null }
	];
	while (stack.length) {
		const { map, parent } = stack.pop()!;
		if (
			map === null ||
			typeof map !== 'object' ||
			Array.isArray(map) ||
			![null, Object.prototype].includes(Object.getPrototypeOf(map))
		)
			fail('INVALID_STRUCTURE', 'Expected a plain node record');
		const entries = Object.entries(map);
		children.set(
			parent,
			entries.map(([key]) => key)
		);
		for (const [key, node] of entries) {
			if (!node || typeof node.id !== 'string' || key !== node.id)
				fail('INVALID_ID', `Record key ${key} must match its node id`);
			if (nodes.has(key)) {
				let ancestor = parent;
				while (ancestor !== null) {
					if (ancestor === key) fail('CYCLE', `Cycle at ${key}`);
					ancestor = parents.get(ancestor) ?? null;
				}
				fail('DUPLICATE_ID', `Duplicate id ${key}`);
			}
			nodes.set(key, node);
			parents.set(key, parent);
			if (node.children !== undefined)
				stack.push({ map: node.children, parent: key });
			else children.set(key, []);
		}
	}
	return { tree, nodes, parents, children };
}
export function getNode<T extends object>(
	index: TreeIndex<T>,
	id: string
): Node<T> {
	return index.nodes.get(id) ?? fail('NOT_FOUND', `Unknown node ${id}`);
}
export function getParent<T extends object>(
	index: TreeIndex<T>,
	id: string
): Node<T> | null {
	getNode(index, id);
	const parent = index.parents.get(id)!;
	return parent === null ? null : getNode(index, parent);
}
export function getAncestors<T extends object>(
	index: TreeIndex<T>,
	id: string
): Node<T>[] {
	const result: Node<T>[] = [];
	let node = getParent(index, id);
	while (node) {
		result.push(node);
		node = getParent(index, node.id);
	}
	return result.reverse();
}
export function getPath<T extends object>(
	index: TreeIndex<T>,
	id: string
): Node<T>[] {
	return [...getAncestors(index, id), getNode(index, id)];
}
export function getDescendants<T extends object>(
	index: TreeIndex<T>,
	id: string
): Node<T>[] {
	getNode(index, id);
	const result: Node<T>[] = [];
	const stack = [...(index.children.get(id) ?? [])].reverse();
	while (stack.length) {
		const current = stack.pop()!;
		result.push(getNode(index, current));
		const children = index.children.get(current)!;
		for (let i = children.length - 1; i >= 0; i--) stack.push(children[i]);
	}
	return result;
}
export interface VisibleNode<T extends object = object> {
	node: Node<T>;
	depth: number;
	parentId: string | null;
	posInSet: number;
	setSize: number;
}
export function flattenVisible<T extends object>(
	index: TreeIndex<T>,
	expandedIds: ReadonlySet<string>
): VisibleNode<T>[] {
	const result: VisibleNode<T>[] = [];
	const stack: {
		id: string;
		depth: number;
		parentId: string | null;
		posInSet: number;
		setSize: number;
	}[] = [];
	const add = (parentId: string | null, depth: number) => {
		const ids = index.children.get(parentId)!;
		for (let i = ids.length - 1; i >= 0; i--)
			stack.push({
				id: ids[i],
				depth,
				parentId,
				posInSet: i + 1,
				setSize: ids.length
			});
	};
	add(null, 0);
	while (stack.length) {
		const row = stack.pop()!;
		result.push({
			node: getNode(index, row.id),
			depth: row.depth,
			parentId: row.parentId,
			posInSet: row.posInSet,
			setSize: row.setSize
		});
		if (expandedIds.has(row.id)) add(row.id, row.depth + 1);
	}
	return result;
}
type Input<T extends object> = { tree: TreeData<T>; treeIndex?: TreeIndex<T> };
function indexFor<T extends object>(input: Input<T>) {
	if (input.treeIndex && input.treeIndex.tree !== input.tree)
		fail('STALE_INDEX', 'Index belongs to another tree');
	return input.treeIndex ?? createTreeIndex(input.tree);
}
function editMap<T extends object>(
	tree: TreeData<T>,
	index: TreeIndex<T>,
	parent: string | null,
	edit: (map: TreeData<T>) => TreeData<T>
): TreeData<T> {
	if (parent === null) return edit(tree);
	const path = getPath(index, parent);
	let updated = edit(path[path.length - 1].children ?? record<Node<T>>());
	for (let i = path.length - 1; i >= 0; i--) {
		const node = path[i];
		const map = i === 0 ? tree : path[i - 1].children!;
		updated = { ...map, [node.id]: { ...node, children: updated } };
	}
	return updated;
}
/** Record enumeration sorts integer-like IDs numerically, regardless of insertion. */
function position<T extends object>(
	map: TreeData<T>,
	node: Node<T>,
	at = Object.keys(map).length
): TreeData<T> {
	const entries = Object.entries(map);
	if (!Number.isInteger(at) || at < 0 || at > entries.length)
		fail('INVALID_INDEX', `Invalid sibling position ${at}`);
	entries.splice(at, 0, [node.id, node]);
	const result = Object.fromEntries(entries);
	if (Object.keys(result).some((id, i) => id !== entries[i][0]))
		fail(
			'UNREPRESENTABLE_ORDER',
			'Record keys cannot represent the requested sibling order'
		);
	return result;
}
export function insertNode<T extends object>(
	input: Input<T> & { node: Node<T>; parentId?: string | null; index?: number }
): TreeData<T> {
	const index = indexFor(input),
		parent = input.parentId ?? null;
	if (parent !== null) getNode(index, parent);
	const subtree = createTreeIndex(
		Object.fromEntries([[input.node.id, input.node]])
	);
	for (const id of subtree.nodes.keys())
		if (index.nodes.has(id)) fail('DUPLICATE_ID', `Duplicate id ${id}`);
	return editMap(input.tree, index, parent, (map) =>
		position(map, input.node, input.index)
	);
}
export function patchNode<T extends object>(
	input: Input<T> & {
		id: string;
		patch: Partial<Omit<NoInfer<T>, 'id' | 'children'>>;
	}
): TreeData<T> {
	const index = indexFor(input),
		node = getNode(index, input.id);
	if ('id' in input.patch || 'children' in input.patch)
		fail('INVALID_ID', 'Use replaceNode to change structure');
	return editMap(input.tree, index, index.parents.get(input.id)!, (map) => ({
		...map,
		[input.id]: { ...node, ...input.patch }
	}));
}
export function replaceNode<T extends object>(
	input: Input<T> & { id: string; node: Node<T> }
): TreeData<T> {
	const index = indexFor(input);
	getNode(index, input.id);
	if (input.node.id !== input.id)
		fail('INVALID_ID', 'Replacement id must match');
	const removed = new Set([
		input.id,
		...getDescendants(index, input.id).map((n) => n.id)
	]);
	for (const id of createTreeIndex(
		Object.fromEntries([[input.id, input.node]])
	).nodes.keys())
		if (index.nodes.has(id) && !removed.has(id))
			fail('DUPLICATE_ID', `Duplicate id ${id}`);
	return editMap(input.tree, index, index.parents.get(input.id)!, (map) => ({
		...map,
		[input.id]: input.node
	}));
}
export function removeNode<T extends object>(
	input: Input<T> & { id: string }
): { tree: TreeData<T>; removedIds: string[] } {
	const index = indexFor(input);
	getNode(index, input.id);
	const removedIds = [
		input.id,
		...getDescendants(index, input.id).map((n) => n.id)
	];
	return {
		tree: editMap(input.tree, index, index.parents.get(input.id)!, (map) => {
			const copy = { ...map };
			delete copy[input.id];
			return copy;
		}),
		removedIds
	};
}
export function moveNode<T extends object>(
	input: Input<T> & { id: string; parentId: string | null; index?: number }
): TreeData<T> {
	const index = indexFor(input),
		node = getNode(index, input.id);
	if (input.parentId !== null) {
		getNode(index, input.parentId);
		if (getPath(index, input.parentId).some((n) => n.id === input.id))
			fail('CYCLE', 'Cannot move into a descendant');
	}
	const removed = removeNode({ ...input, treeIndex: index }).tree;
	const nextIndex = createTreeIndex(removed);
	return editMap(removed, nextIndex, input.parentId, (map) =>
		position(map, node, input.index)
	);
}
export function reorderNode<T extends object>(
	input: Input<T> & { id: string; index: number }
): TreeData<T> {
	const index = indexFor(input);
	getNode(index, input.id);
	return moveNode({
		...input,
		treeIndex: index,
		parentId: index.parents.get(input.id)!
	});
}
/** Conversion owns structural fields; original child arrays are replaced by records. */
export type ConvertedNode<T extends object> = Omit<T, 'id' | 'children'> & {
	id: string;
	children: ConvertedTree<T>;
};
export type ConvertedTree<T extends object> = Record<string, ConvertedNode<T>>;
export function validateTree<T extends object>(tree: TreeData<T>): void {
	createTreeIndex(tree);
}
export function fromFlat<T extends object>(
	items: readonly T[],
	options: {
		getId: (item: T) => string | null | undefined;
		getParentId: (item: T) => string | null | undefined;
		orphanPolicy?: 'error' | 'root';
	}
): ConvertedTree<T> {
	const nodes = new Map<string, ConvertedNode<T>>(),
		parents = new Map<string, string | null>();
	for (const item of items) {
		const id = options.getId(item);
		if (typeof id !== 'string') fail('INVALID_ID', 'Expected string id');
		if (nodes.has(id)) fail('DUPLICATE_ID', `Duplicate id ${id}`);
		nodes.set(id, { ...item, id, children: record<ConvertedNode<T>>() });
		parents.set(id, options.getParentId(item) ?? null);
	}
	const tree = record<ConvertedNode<T>>();
	for (const [id, node] of nodes) {
		let parent: string | null = parents.get(id) ?? null;
		if (parent !== null && !nodes.has(parent)) {
			if (options.orphanPolicy !== 'root')
				fail('ORPHAN', `Missing parent ${parent}`);
			parent = null;
			parents.set(id, null);
		}
		(parent === null ? tree : nodes.get(parent)!.children!)[id] = node;
	}
	const completed = new Set<string>();
	for (const id of nodes.keys()) {
		const visiting = new Set<string>();
		let current: string | null = id;
		while (current !== null && !completed.has(current)) {
			if (visiting.has(current)) fail('CYCLE', `Cycle at ${current}`);
			visiting.add(current);
			current = parents.get(current) ?? null;
		}
		for (const visited of visiting) completed.add(visited);
	}
	return tree;
}
export function toFlat<
	T extends object,
	R = Omit<T, 'children' | 'parentId'> & { id: string; parentId: string | null }
>(
	tree: TreeData<T>,
	options?: { map: (node: Node<T>, parentId: string | null) => R }
): R[] {
	const index = createTreeIndex(tree);
	return flattenVisible(index, new Set(index.nodes.keys())).map(
		({ node, parentId }) => {
			if (options) return options.map(node, parentId);
			const copy = { ...node, parentId };
			delete copy.children;
			return copy as R;
		}
	);
}
export function fromNestedArray<T extends object>(
	items: readonly T[],
	options: {
		getId: (item: T) => string | null | undefined;
		getChildren: (item: T) => readonly T[] | null | undefined;
	}
): ConvertedTree<T> {
	const result = record<ConvertedNode<T>>(),
		seen = new Set<string>();
	const stack: { items: readonly T[]; map: ConvertedTree<T> }[] = [
		{ items, map: result }
	];
	while (stack.length) {
		const frame = stack.pop()!;
		for (const item of frame.items) {
			const id = options.getId(item);
			if (typeof id !== 'string') fail('INVALID_ID', 'Expected string id');
			if (seen.has(id)) fail('DUPLICATE_ID', `Duplicate or cyclic id ${id}`);
			seen.add(id);
			const children = record<ConvertedNode<T>>();
			frame.map[id] = { ...item, id, children };
			stack.push({ items: options.getChildren(item) ?? [], map: children });
		}
	}
	return result;
}
export type NestedNode<T extends object> = Omit<T, 'id' | 'children'> & {
	id: string;
	children: NestedNode<T>[];
};
export type NestedResult<R> = Omit<R, 'children'> & {
	children: NestedResult<R>[];
};
export function toNestedArray<
	T extends object,
	R extends object = Omit<T, 'id' | 'children'> & { id: string }
>(
	tree: TreeData<T>,
	options?: { map: (node: Node<T>) => R }
): NestedResult<R>[] {
	const index = createTreeIndex(tree),
		result: NestedResult<R>[] = [],
		arrays = new Map<string | null, NestedResult<R>[]>([[null, result]]);
	for (const { node, parentId } of flattenVisible(
		index,
		new Set(index.nodes.keys())
	)) {
		const converted = {
			...(options ? options.map(node) : node),
			children: []
		} as NestedResult<R>;
		arrays.get(parentId)!.push(converted);
		arrays.set(node.id, converted.children);
	}
	return result;
}

/** Stateful, framework-independent owner of immutable snapshots and reusable indexes.
 * Each successful mutation rebuilds the index in O(n); reads reuse it.
 * Do not mutate exposed trees or index maps directly.
 */
export function createTreeController<T extends object>(
	initialTree: TreeData<T>
) {
	let tree = initialTree,
		index = createTreeIndex(tree);
	const input = () => ({ tree, treeIndex: index });
	const update = (next: TreeData<T>) => {
		const nextIndex = createTreeIndex(next);
		tree = next;
		index = nextIndex;
		return tree;
	};
	return {
		get tree() {
			return tree;
		},
		get index() {
			return index;
		},
		setTree: update,
		getNode: (id: string) => getNode(index, id),
		getParent: (id: string) => getParent(index, id),
		getAncestors: (id: string) => getAncestors(index, id),
		getDescendants: (id: string) => getDescendants(index, id),
		getPath: (id: string) => getPath(index, id),
		flattenVisible: (expandedIds: ReadonlySet<string>) =>
			flattenVisible(index, expandedIds),
		insertNode: (
			options: Omit<Parameters<typeof insertNode<T>>[0], keyof Input<T>>
		) => update(insertNode({ ...input(), ...options })),
		patchNode: (
			options: Omit<Parameters<typeof patchNode<T>>[0], keyof Input<T>>
		) => update(patchNode({ ...input(), ...options })),
		replaceNode: (
			options: Omit<Parameters<typeof replaceNode<T>>[0], keyof Input<T>>
		) => update(replaceNode({ ...input(), ...options })),
		moveNode: (
			options: Omit<Parameters<typeof moveNode<T>>[0], keyof Input<T>>
		) => update(moveNode({ ...input(), ...options })),
		reorderNode: (
			options: Omit<Parameters<typeof reorderNode<T>>[0], keyof Input<T>>
		) => update(reorderNode({ ...input(), ...options })),
		removeNode: (options: { id: string }) => {
			const result = removeNode({ ...input(), ...options });
			update(result.tree);
			return result;
		}
	};
}
