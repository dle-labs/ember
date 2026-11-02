# @dle.dev/ember

Headless Svelte 5 trees and framework-independent tree data utilities.

```sh
pnpm add @dle.dev/ember
```

## Controlled TreeView

`TreeView` renders a keyed record tree without changing its nodes. Expansion,
selection and focus are separate from application/query data. Children are only
rendered while their ancestors are expanded; all visible rows are mounted (this
is not a virtualizer).

```svelte
<script lang="ts">
  import { TreeView } from '@dle.dev/ember';
  import { fromFlat, patchNode } from '@dle.dev/ember/tree';

  let tree = $state.raw(fromFlat([
    { id: 'office', parentId: null, name: 'Office' },
    { id: 'desk', parentId: 'office', name: 'Desk' }
  ], {
    getId: (item) => item.id,
    getParentId: (item) => item.parentId
  }));
  let expandedIds = $state<string[]>([]);
  let selectedIds = $state<string[]>([]);
</script>

<TreeView
  {tree}
  label="Collections"
  getLabel={(value) => value.name}
  bind:expandedIds
  bind:selectedIds
  selection="single"
>
  {#snippet node(value, context)}
    <div style:padding-left={`${context.depth * 16}px`}>
      {#if context.hasChildren}
        <button
          tabindex="-1"
          aria-disabled="false"
          aria-label={`Toggle ${value.name}`}
          aria-expanded={context.expanded}
          onclick={context.toggle}
        >{context.expanded ? '−' : '+'}</button>
      {/if}
      <button tabindex="-1" disabled={context.disabled} onclick={context.activate}>
        {value.name}
      </button>
    </div>
  {/snippet}
</TreeView>
```

Props:

- `tree`: `TreeData<T>` keyed by each node's globally unique string `id`.
- `node`: snippet receiving `(node, context)`. Context contains `depth` (zero
  based), `expanded`, `selected`, `disabled`, `hasChildren`, `active`, `toggle`
  and `activate`.
- `label`: required accessible tree name; `getLabel` supplies each row's name.
- `expandedIds`, `selectedIds`: bindable arrays; neither lives inside the data.
- `selection`: `none`, `single` (default), or `multiple`. Single activation
  selects one ID; multiple activation toggles the ID. `none` only activates.
- `deselectable`: optionally lets single selection toggle off on repeated activation
  (default false); applies equally to keyboard and pointer activation.
- `disabledIds`: blocks selection/activation, but allows expanding a parent.
- `activeId`: reveals ancestors when the ID or tree revision changes. Manual
  collapse remains respected until the next such change.
- `onActivate(id)`: application navigation/activation callback.

Tree rows have hierarchy metadata and roving focus. Arrow keys navigate/expand,
Home/End move to the ends, Enter/Space activate, and typing searches labels.
Focus recovers after collapse/deletion; removed selection/expansion IDs are
pruned on data revisions. Put row-label/toggle buttons at `tabindex="-1"` to
avoid duplicate tab stops. Independently tabbable action menus must manage their
own keys/focus. Explicitly set `aria-disabled="false"` on controls that remain
available within a disabled-selection row. Snippets remain responsible for
accessible names and behavior of their own controls.

Replace the tree reference after immutable updates. The index rebuilds on data
revisions, not on selection or expansion changes. Do not mutate reused index
snapshots or query-owned nodes in place.

## Immutable tree utilities

Import these from `@dle.dev/ember/tree`. This entry point contains no Svelte
components and can also be used from Node.

```ts
import {
  createTreeIndex, getNode, getPath, patchNode, insertNode, removeNode
} from '@dle.dev/ember/tree';

const index = createTreeIndex(tree);
const node = getNode(index, 'desk');
const path = getPath(index, 'desk'); // root through target, as nodes
const renamed = patchNode({ tree, treeIndex: index, id: 'desk', patch: { name: 'Work desk' } });
const inserted = insertNode({ tree: renamed, parentId: 'office', node: { id: 'lamp', name: 'Lamp' } });
const { tree: remaining, removedIds } = removeNode({ tree: inserted, id: 'desk' });
```

- `createTreeIndex(tree)`: validated node, parent and ordered-child maps.
- `validateTree(tree)`: throws `TreeError` for invalid structure.
- `getNode`, `getParent`, `getAncestors`, `getDescendants`, `getPath`: indexed reads.
- `flattenVisible(index, expandedSet)`: visible rows with node, depth, parent ID,
  position and sibling count. Does not flatten hidden descendants.
- `insertNode({ tree, node, parentId?, index? })`: root/child insertion.
- `patchNode({ tree, id, patch })`: preserves ID and children; structural fields
  are rejected. Unrelated branches and payload objects retain their identity.
- `replaceNode({ tree, id, node })`: explicitly replaces the complete subtree.
- `removeNode({ tree, id })`: returns the new tree and all removed IDs.
- `moveNode({ tree, id, parentId, index? })`: moves the subtree, rejecting cycles.
- `reorderNode({ tree, id, index })`: position within the final sibling list.

Mutation inputs optionally accept `treeIndex` for the exact immutable input
snapshot. A different snapshot throws `STALE_INDEX`. Missing nodes, duplicate
IDs, cycles and invalid positions throw typed `TreeError` errors. Moves change
structural placement only: application fields such as `parentId` must be patched
by the application if it stores them in payloads too.

`createTreeController(tree)` owns a snapshot and reused read index. Its read and
mutation methods mirror these utilities; `setTree` replaces external data.
Mutations commit only after validation and return the current snapshot. The
controller is framework-independent, not a reactive store: assign its returned
snapshot to your state/query cache. Never hand it query data and then mutate that
data in place.

## Conversions

- `fromFlat(items, { getId, getParentId, orphanPolicy? })`: two-pass linking;
  default missing-parent handling is `error`, or explicitly choose `root`.
- `toFlat(tree)`: depth-first payload records with structural `parentId` and no
  nested children. Optional `map(node, parentId)` customizes the output.
- `fromNestedArray(items, { getId, getChildren })`: convert nested arrays without
  modifying the inputs. Input `id` and `children` are replaced by canonical fields.
- `toNestedArray(tree, { map? })`: nested arrays; optional mapper customizes
  payloads. Output `children` is always the converted array.

Conversions preserve payload fields and validate IDs/structure. Sibling order
follows JavaScript record enumeration: integer-like keys are numerically sorted.
Insertion/reorder requests that cannot be represented throw
`UNREPRESENTABLE_ORDER`; use non-integer IDs for arbitrary order. Flat export
uses actual structure even if payload `parentId` fields are stale.

## Performance and compatibility

Index construction and controller reindexing are O(N); indexed node/parent reads
are O(1). Ancestor paths cost O(depth), visible flattening O(visible nodes), and
subtree enumeration/removal must visit descendants. Immutable edits copy affected
ancestor maps, so broad sibling maps still cost O(width). Full controller
mutations rebuild the index; they are not advertised as constant-time writes.

`Tree` and the original root-level `insertNode`, `updateNode`, `deleteNode`
exports remain for compatibility. Those helpers mutate their input and search by
DFS. Prefer `TreeView` and the **immutable subpath** for new code. Legacy `Tree`
now preserves input identities and forwards nested transition configuration; it
is a recursive renderer, not the accessible interaction controller.

## Development

Node >=24.7.0 and pnpm 12.16.1:

```sh
pnpm check
pnpm lint
ENVIRONMENT=ci pnpm test --browser.headless
ENVIRONMENT=ci pnpm build
node scripts/benchmark-tree.mjs
```

Install Chromium with `pnpm exec playwright install chromium` before browser tests.
Benchmarks report local utility timings, not browser rendering guarantees.
