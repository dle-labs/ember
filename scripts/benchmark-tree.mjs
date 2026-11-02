// Run `pnpm prepack && node scripts/benchmark-tree.mjs`.
// Timings are local observations, not a universal performance guarantee.
import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';
import {
	createTreeIndex,
	getNode,
	patchNode,
	moveNode
} from '../dist/tree/data.js';

let observed;
function measure(name, iterations, run) {
	for (let i = 0; i < Math.min(iterations, 10); i++) observed = run();
	const start = performance.now();
	for (let i = 0; i < iterations; i++) observed = run();
	return {
		operation: name,
		iterations,
		milliseconds: +(performance.now() - start).toFixed(3)
	};
}
function plainLookup(tree, id) {
	const stack = Object.values(tree);
	while (stack.length) {
		const node = stack.pop();
		if (node.id === id) return node;
		if (node.children)
			for (const child of Object.values(node.children)) stack.push(child);
	}
}
for (const size of [1000, 10000])
	for (const shape of ['wide', 'deep']) {
		let tree = {};
		if (shape === 'wide')
			tree = Object.fromEntries(
				Array.from({ length: size }, (_, i) => [
					`n${i}`,
					{ id: `n${i}`, label: `Node ${i}` }
				])
			);
		else
			for (let i = size - 1; i >= 0; i--)
				tree = {
					[`n${i}`]: { id: `n${i}`, label: `Node ${i}`, children: tree }
				};
		const index = createTreeIndex(tree),
			target = `n${size - 1}`,
			parentId = shape === 'wide' ? 'n0' : null;
		const patched = patchNode({
			tree,
			treeIndex: index,
			id: target,
			patch: { label: 'changed' }
		});
		const moved = moveNode({ tree, treeIndex: index, id: target, parentId });
		assert.equal(getNode(createTreeIndex(patched), target).label, 'changed');
		assert.equal(createTreeIndex(moved).parents.get(target), parentId);
		assert.equal(createTreeIndex(moved).nodes.size, size);
		assert.equal(getNode(index, target).label, `Node ${size - 1}`);
		assert.equal(plainLookup(tree, target), getNode(index, target));
		console.log(
			`${shape} tree: ${size} nodes; correctness: patch, move, count, unchanged source passed`
		);
		console.table([
			...(shape === 'wide'
				? [measure('direct root record lookup', 100000, () => tree[target])]
				: []),
			measure('plain traversal lookup', 1000, () => plainLookup(tree, target)),
			measure('indexed lookup', 100000, () => getNode(index, target)),
			measure('build validated index', 20, () => createTreeIndex(tree)),
			measure('patch with reusable index', 20, () =>
				patchNode({
					tree,
					treeIndex: index,
					id: target,
					patch: { label: 'changed' }
				})
			),
			measure('move with reusable index', 20, () =>
				moveNode({ tree, treeIndex: index, id: target, parentId })
			)
		]);
	}
console.log(
	`Observed final mutation roots: ${Object.keys(observed).join(', ')}`
);
