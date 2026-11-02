import { expect, expectTypeOf, test } from 'vitest';

import {
	createTreeController,
	createTreeIndex,
	flattenVisible,
	fromFlat,
	fromNestedArray,
	getPath,
	insertNode,
	moveNode,
	patchNode,
	removeNode,
	reorderNode,
	replaceNode,
	toFlat,
	toNestedArray
} from './tree.data';

const tree = {
	a: { id: 'a', label: 'A', children: { b: { id: 'b', label: 'B' } } },
	c: { id: 'c', label: 'C' }
};
test('indexes paths and visible sibling metadata', () => {
	const index = createTreeIndex(tree);
	expect(getPath(index, 'b').map((n) => n.id)).toEqual(['a', 'b']);
	expect(
		flattenVisible(index, new Set(['a'])).map(
			({ node, depth, posInSet, setSize }) => [
				node.id,
				depth,
				posInSet,
				setSize
			]
		)
	).toEqual([
		['a', 0, 1, 2],
		['b', 1, 1, 1],
		['c', 0, 2, 2]
	]);
});
test('immutable CRUD shares untouched branches and preserves ordering', () => {
	const patched = patchNode({ tree, id: 'b', patch: { label: 'BB' } });
	expect(patched.c).toBe(tree.c);
	expect(tree.a.children.b.label).toBe('B');
	const inserted = insertNode({
		tree: patched,
		node: { id: 'd', label: 'D' },
		index: 1
	});
	expect(Object.keys(inserted)).toEqual(['a', 'd', 'c']);
	const moved = moveNode({ tree: inserted, id: 'b', parentId: 'd' });
	expect(moved.d.children?.b.label).toBe('BB');
	expect(Object.keys(reorderNode({ tree: moved, id: 'c', index: 0 }))).toEqual([
		'c',
		'a',
		'd'
	]);
	expect(
		replaceNode({ tree: moved, id: 'b', node: { id: 'b', label: 'new' } }).d
			.children?.b.label
	).toBe('new');
	expect(removeNode({ tree: moved, id: 'd' }).removedIds).toEqual(['d', 'b']);
	expect(() => moveNode({ tree, id: 'a', parentId: 'b' })).toThrow();
});
test('validates malformed trees and supports unsafe string identifiers', () => {
	expect(() => createTreeIndex({ a: { id: 'wrong' } })).toThrow();
	expect(() =>
		createTreeIndex({ a: { id: 'a', children: { a: { id: 'a' } } } })
	).toThrow();
	const cyclic = { id: 'a', children: {} };
	cyclic.children = { a: cyclic };
	expect(() => createTreeIndex({ a: cyclic })).toThrow();
	const flat = fromFlat(
		[
			{ key: '__proto__', parent: null },
			{ key: 'constructor', parent: '__proto__' }
		],
		{ getId: (n) => n.key, getParentId: (n) => n.parent }
	);
	expect(createTreeIndex(flat).nodes.size).toBe(2);
	expect(() =>
		fromFlat([{ id: 'a', parent: 'missing' }], {
			getId: (n) => n.id,
			getParentId: (n) => n.parent
		})
	).toThrow();
});
test('converts flat and nested arrays without losing payload', () => {
	const flat = [
		{ id: 'b', parent: 'a', label: 'B' },
		{ id: 'a', parent: null, label: 'A' }
	];
	const result = fromFlat(flat, {
		getId: (n) => n.id,
		getParentId: (n) => n.parent
	});
	expect(toFlat(result).map((n) => n.label)).toEqual(['A', 'B']);
	const nested = fromNestedArray(
		[{ key: 'a', items: [{ key: 'b', items: [] }] }],
		{ getId: (n) => n.key, getChildren: (n) => n.items }
	);
	expect(toNestedArray(nested)[0].children[0].id).toBe('b');
});

test('handles deep and wide trees iteratively and rejects stale indexes', () => {
	let deep: import('./tree.types').TreeData = {};
	for (let i = 5000; i >= 0; i--)
		deep = { [`n${i}`]: { id: `n${i}`, children: deep } };
	const index = createTreeIndex(deep);
	expect(getPath(index, 'n5000')).toHaveLength(5001);
	expect(toFlat(deep)).toHaveLength(5001);
	expect(() =>
		patchNode({ tree: {}, treeIndex: index, id: 'n0', patch: {} })
	).toThrow();
	const wide = Object.fromEntries(
		Array.from({ length: 10000 }, (_, i) => [`n${i}`, { id: `n${i}` }])
	);
	expect(createTreeIndex(wide).nodes.size).toBe(10000);
});

test('maps nested conversion payloads and flat parent metadata', () => {
	expect(
		toFlat(tree, { map: (node, parentId) => ({ key: node.id, parentId }) })
	).toEqual([
		{ key: 'a', parentId: null },
		{ key: 'b', parentId: 'a' },
		{ key: 'c', parentId: null }
	]);
	expect(toNestedArray(tree, { map: (node) => ({ key: node.id }) })[0]).toEqual(
		{ key: 'a', children: [{ key: 'b', children: [] }] }
	);
});

test.each([
	[
		'missing patch',
		() => patchNode({ tree, id: 'missing', patch: { label: 'x' } }),
		'NOT_FOUND'
	],
	['missing remove', () => removeNode({ tree, id: 'missing' }), 'NOT_FOUND'],
	[
		'missing insert parent',
		() =>
			insertNode({ tree, node: { id: 'x', label: 'X' }, parentId: 'missing' }),
		'NOT_FOUND'
	],
	[
		'duplicate insertion',
		() => insertNode({ tree, node: { id: 'b', label: 'X' } }),
		'DUPLICATE_ID'
	],
	[
		'duplicate subtree',
		() =>
			insertNode({
				tree,
				node: { id: 'x', label: 'X', children: { c: { id: 'c', label: 'C' } } }
			}),
		'DUPLICATE_ID'
	],
	[
		'invalid insertion position',
		() => insertNode({ tree, node: { id: 'x', label: 'X' }, index: -1 }),
		'INVALID_INDEX'
	],
	[
		'fractional insertion position',
		() => insertNode({ tree, node: { id: 'x', label: 'X' }, index: 0.5 }),
		'INVALID_INDEX'
	],
	[
		'replacement id',
		() => replaceNode({ tree, id: 'a', node: { id: 'x', label: 'X' } }),
		'INVALID_ID'
	],
	[
		'replacement collision',
		() =>
			replaceNode({
				tree,
				id: 'a',
				node: { id: 'a', label: 'X', children: { c: { id: 'c', label: 'C' } } }
			}),
		'DUPLICATE_ID'
	],
	['self move', () => moveNode({ tree, id: 'a', parentId: 'a' }), 'CYCLE'],
	[
		'missing move parent',
		() => moveNode({ tree, id: 'a', parentId: 'missing' }),
		'NOT_FOUND'
	],
	[
		'flat duplicate',
		() =>
			fromFlat([{ id: 'x' }, { id: 'x' }], {
				getId: (n) => n.id,
				getParentId: () => null
			}),
		'DUPLICATE_ID'
	],
	[
		'flat cycle',
		() =>
			fromFlat(
				[
					{ id: 'x', p: 'y' },
					{ id: 'y', p: 'x' }
				],
				{ getId: (n) => n.id, getParentId: (n) => n.p }
			),
		'CYCLE'
	],
	[
		'nested duplicate',
		() =>
			fromNestedArray([{ id: 'x' }, { id: 'x' }], {
				getId: (n) => n.id,
				getChildren: () => []
			}),
		'DUPLICATE_ID'
	]
])('rejects %s with a typed error', (_label, run, code) => {
	try {
		run();
		expect.fail('Expected TreeError');
	} catch (error) {
		expect(error).toMatchObject({ name: 'TreeError', code });
	}
});
test('promotes orphans explicitly and keeps supplied sibling order', () => {
	const result = fromFlat(
		[
			{ id: 'b', p: 'missing' },
			{ id: 'a', p: null }
		],
		{ getId: (n) => n.id, getParentId: (n) => n.p, orphanPolicy: 'root' }
	);
	expect(Object.keys(result)).toEqual(['b', 'a']);
});
test('moves between siblings, roots, and descendant maps without mutating input', () => {
	const reordered = reorderNode({ tree, id: 'a', index: 1 });
	expect(Object.keys(reordered)).toEqual(['c', 'a']);
	const rooted = moveNode({ tree, id: 'b', parentId: null, index: 0 });
	expect(Object.keys(rooted)).toEqual(['b', 'a', 'c']);
	expect(rooted.a.children).toEqual({});
	expect(rooted.c).toBe(tree.c);
	expect(Object.keys(tree.a.children)).toEqual(['b']);
});

test('default flat conversion records structural parent IDs and roundtrips', () => {
	const result = toFlat(tree);
	expect(result.map((n) => [n.id, n.parentId])).toEqual([
		['a', null],
		['b', 'a'],
		['c', null]
	]);
	const restored = fromFlat(result, {
		getId: (n) => n.id,
		getParentId: (n) => n.parentId
	});
	expect(restored.a.children.b.id).toBe('b');
	expect(Object.keys(restored)).toEqual(['a', 'c']);
	expect(toFlat(restored)).toEqual(result);
	const stale = { root: { id: 'root', parentId: 'stale' } };
	expect(toFlat(stale)[0].parentId).toBe(null);
});
test('rejects an unrepresentable numeric sibling order', () => {
	const numeric = { '1': { id: '1' }, '2': { id: '2' } };
	expect(() => reorderNode({ tree: numeric, id: '2', index: 0 })).toThrowError(
		/order/i
	);
});

test('conversion types replace child arrays and guarantee child records', () => {
	interface Item {
		id: string;
		label: string;
		children?: Item[];
	}
	const input: Item[] = [
		{ id: 'root', label: 'Root', children: [{ id: 'leaf', label: 'Leaf' }] }
	];
	const result = fromNestedArray(input, {
		getId: (n) => n.id,
		getChildren: (n) => n.children
	});
	expectTypeOf(result.root.children.leaf.label).toEqualTypeOf<string>();
	const flat = fromFlat(input, { getId: (n) => n.id, getParentId: () => null });
	const dto: Record<
		string,
		{ id: string; label: string; children: Record<string, unknown> }
	> = flat;
	expect(dto.root.children).toEqual({});
});

test('controller reuses its index for reads and updates immutable snapshots', () => {
	const controller = createTreeController(tree);
	const before = controller.index;
	expect(controller.getNode('b')).toBe(tree.a.children.b);
	expect(controller.index).toBe(before);
	controller.patchNode({ id: 'b', patch: { label: 'new' } });
	expect(controller.tree.c).toBe(tree.c);
	expect(controller.index).not.toBe(before);
	expect(controller.getNode('b').label).toBe('new');
	expect(tree.a.children.b.label).toBe('B');
	controller.insertNode({ node: { id: 'd', label: 'D' } });
	controller.moveNode({ id: 'b', parentId: 'd' });
	controller.reorderNode({ id: 'd', index: 0 });
	controller.replaceNode({ id: 'b', node: { id: 'b', label: 'replacement' } });
	expect(controller.getNode('b').label).toBe('replacement');
	expect(controller.removeNode({ id: 'd' }).removedIds).toEqual(['d', 'b']);
	expect(() => controller.getNode('d')).toThrow();
});

test('conversion validates optional identifiers without caller assertions', () => {
	const items: { id?: string }[] = [{}];
	expect(() =>
		fromFlat(items, { getId: (n) => n.id, getParentId: () => null })
	).toThrowError(/string id/);
	expect(() =>
		fromNestedArray(items, { getId: (n) => n.id, getChildren: () => [] })
	).toThrowError(/string id/);
});

test('payload types remain precise across patch and nested exports', () => {
	const result = toNestedArray(tree);
	expectTypeOf(result[0].label).toEqualTypeOf<string>();
	expectTypeOf(result[0].id).toEqualTypeOf<string>();
	const mapped = toNestedArray(tree, {
		map: (n) => ({ id: n.id, children: 'replace' })
	});
	expectTypeOf(mapped[0].children).not.toEqualTypeOf<string>();
	expect(mapped[0].children[0].id).toBe('b');
	// Compile-time negative assertion; never execute this invalid call.
	// eslint-disable-next-line no-constant-condition
	if (false) {
		// @ts-expect-error A numeric label must not satisfy a string payload.
		patchNode({ tree, id: 'a', patch: { label: 123 } });
	}
});

test.each(
	[null, [], 0, 'invalid', new Map(), new Date()].map((invalid) => ({
		invalid
	}))
)('rejects malformed root records: $invalid', ({ invalid }) => {
	expect(() => createTreeIndex(invalid as never)).toThrowError(/record/i);
});
test.each(
	[null, [], 0, 'invalid', new Map(), new Date()].map((invalid) => ({
		invalid
	}))
)('rejects malformed child records: $invalid', ({ invalid }) => {
	expect(() =>
		createTreeIndex({ a: { id: 'a', children: invalid } } as never)
	).toThrowError(/record/i);
});

test('undefined children remain a valid optional field', () => {
	expect(
		createTreeIndex({ a: { id: 'a', children: undefined } }).nodes.size
	).toBe(1);
});
test('conversion getters retain payload types through flat, nested, and controllers', () => {
	interface Category {
		key: string;
		title: string;
		parent?: string;
		children?: Category[];
	}
	const input: Category[] = [
		{ key: 'a', title: 'A', children: [{ key: 'b', title: 'B', parent: 'a' }] }
	];
	const nested = fromNestedArray(input, {
		getId: (item) => item.key,
		getChildren: (item) => item.children
	});
	expectTypeOf(nested.a.title).toEqualTypeOf<string>();
	expectTypeOf(nested.a.children.b.title).toEqualTypeOf<string>();
	expectTypeOf(nested.a.children).not.toEqualTypeOf<Category[]>();
	const flat = toFlat(nested);
	expectTypeOf(flat[0].parentId).toEqualTypeOf<string | null>();
	expectTypeOf(flat[0].title).toEqualTypeOf<string>();
	const restored = fromFlat(flat, {
		getId: (item) => item.id,
		getParentId: (item) => item.parentId
	});
	expectTypeOf(restored.a.children.b.title).toEqualTypeOf<string>();
	const controller = createTreeController(nested);
	expectTypeOf(controller.getNode('b').title).toEqualTypeOf<string>();
	controller.patchNode({ id: 'b', patch: { title: 'Updated' } });
	expect(controller.getNode('b').title).toBe('Updated');
	expect(nested.a.children.b.title).toBe('B');
	const output = toNestedArray(controller.tree, {
		map: (item) => ({ key: item.key, title: item.title })
	});
	expectTypeOf(output[0].children[0].title).toEqualTypeOf<string>();
	expect(output[0].children[0].title).toBe('Updated');
});

test('controller validates external replacement before atomically publishing it', () => {
	const controller = createTreeController(tree);
	const replacement = { other: { id: 'other', label: 'Other' } };
	expect(controller.setTree(replacement)).toBe(replacement);
	expect(controller.tree).toBe(replacement);
	expect(controller.index.tree).toBe(replacement);
	expect(controller.getNode('other').label).toBe('Other');
	const beforeIndex = controller.index;
	expect(() =>
		controller.setTree({ bad: { id: 'wrong', label: 'Bad' } })
	).toThrow();
	expect(controller.tree).toBe(replacement);
	expect(controller.index).toBe(beforeIndex);
});
