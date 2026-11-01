import { cloneDeep } from 'lodash-es';
import { describe, expect, it } from 'vitest';

import {
	deleteNode,
	insertNode,
	type Node,
	type TreeData,
	updateNode
} from '#lib';

describe('tree-utils', () => {
	const mockTree: TreeData = {
		a: {
			id: 'a',
			children: {
				b: {
					id: 'b',
					children: {
						c: { id: 'c' }
					}
				},
				d: { id: 'd' }
			}
		},
		e: { id: 'e' }
	};

	const createTree = (): TreeData => cloneDeep(mockTree);

	it('should remove the root node', () => {
		const tree = createTree();
		deleteNode({ tree: tree, node: tree.e });
		expect(tree.e).toBeUndefined();
		expect(tree.a).toBeDefined();
	});

	it('should remove a nested node', () => {
		const tree = createTree();
		deleteNode({ tree: tree, node: tree.a.children!.b });
		expect(tree.a.children!.b).toBeUndefined();
		expect(tree.a.children!.d).toBeDefined();
	});

	it('should remove a nested leaf node', () => {
		const tree = createTree();
		deleteNode({ tree, node: tree.a.children!.b.children!.c });
		expect(tree.a.children!.b.children!.c).toBeUndefined();
		// sibling branches untouched
		expect(tree.a.children!.d).toBeDefined();
	});

	it('should remove a root node with children (subtree)', () => {
		const tree = createTree();
		deleteNode({ tree, node: tree.a });
		expect(tree.a).toBeUndefined();
		expect(tree.e).toBeDefined();
	});

	it('should not throw when deleting a node that is not in the tree', () => {
		const tree = createTree();
		const snapshot = cloneDeep(tree);

		expect(() =>
			deleteNode({ tree, node: { id: 'does-not-exist' } as Node })
		).not.toThrow();

		// ensure tree unchanged
		expect(tree).toEqual(snapshot);
	});

	it('should add a node as a child of a given parent', () => {
		const tree = createTree();
		const node: Node = { id: 'x' };
		insertNode({
			tree,
			parent: tree.a.children!.d,
			node
		});
		expect(tree.a.children!.d.children!.x.id).toBe('x');
	});

	it('should create the children map when inserting into a parent without children', () => {
		const tree = createTree();
		const node: Node = { id: 'y' };

		// tree.e has no children in the fixture
		insertNode({
			tree,
			parent: tree.e,
			node
		});

		expect(tree.e.children).toBeDefined();
		expect(tree.e.children!.y.id).toBe('y');
	});

	it('should update a node', () => {
		const tree = createTree();

		const updated: Node = { id: 'b', foo: 123 };
		updateNode({
			tree,
			node: updated
		});

		expect(tree.a.children!.b.foo).toBe(123);
	});

	it('should update a root node', () => {
		const tree = createTree();

		updateNode({
			tree,
			node: { id: 'e', foo: 'bar' }
		});

		expect(tree.e.foo).toBe('bar');
	});

	it('should not throw when updating a node that does not exist', () => {
		const tree = createTree();
		const snapshot = cloneDeep(tree);

		expect(() =>
			updateNode({
				tree,
				node: { id: 'does-not-exist', foo: 999 } as Node
			})
		).not.toThrow();

		expect(tree).toEqual(snapshot);
	});
});
