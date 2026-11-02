export const MOCK_TREE = {
	'01992b16-2674-7a73-9871-0b0480fde233': {
		id: '01992b16-2674-7a73-9871-0b0480fde233',
		name: 'office',
		children: {}
	},
	'01992b16-3d51-7d03-9a11-a44ccfcd5344': {
		id: '01992b16-3d51-7d03-9a11-a44ccfcd5344',
		name: 'bedroom',
		children: {
			'01992b1b-d067-7563-9621-954dc16e5bde': {
				id: '01992b1b-d067-7563-9621-954dc16e5bde',
				name: 'daniel',
				children: {
					'01998cad-e659-7c71-92e6-39ff2aff9079': {
						id: '01998cad-e659-7c71-92e6-39ff2aff9079',
						name: 'thing',
						children: {
							'01998cae-0f8b-7183-8727-08c21282a51d': {
								id: '01998cae-0f8b-7183-8727-08c21282a51d',
								name: 'other-thing',
								children: {
									'01998cae-3488-7dd0-8613-a00573b19f74': {
										id: '01998cae-3488-7dd0-8613-a00573b19f74',
										name: 'latest-thing',
										children: {}
									}
								}
							}
						}
					},
					'0199a004-378d-7ba3-951d-8fd000223eef': {
						id: '0199a004-378d-7ba3-951d-8fd000223eef',
						name: 'office-thing-thing',
						children: {}
					},
					'0199a004-ba0b-7b63-ad4c-f50b8f88d15a': {
						id: '0199a004-ba0b-7b63-ad4c-f50b8f88d15a',
						name: 'adasdasd',
						children: {}
					},
					'0199a19a-a7b9-7f73-8d1c-cb78111c9ab4': {
						id: '0199a19a-a7b9-7f73-8d1c-cb78111c9ab4',
						name: 'other-thing-thing',
						tags: []
					},
					'0199a19a-daab-7241-92e8-1bccc9c69b70': {
						id: '0199a19a-daab-7241-92e8-1bccc9c69b70',
						name: 'yet-another-new-stuff',
						tags: []
					}
				}
			}
		}
	}
};

export const MOCK_CODE_STRING = `<script lang="ts">
  import { TreeView } from '@dle.dev/ember';
  import { fromFlat, patchNode } from '@dle.dev/ember/tree';

  let tree = $state.raw(fromFlat([
    { id: 'root', parentId: null, name: 'Root' },
    { id: 'child', parentId: 'root', name: 'Child' }
  ], { getId: (node) => node.id, getParentId: (node) => node.parentId }));
  let expandedIds = $state<string[]>([]);
  let selectedIds = $state<string[]>([]);

  function rename(id: string) {
    tree = patchNode({ tree, id, patch: { name: 'Updated node' } });
  }
</script>

<TreeView {tree} label="Collections" bind:expandedIds bind:selectedIds>
  {#snippet node(value, context)}
    <div style:padding-left={context.depth * 16 + 'px'}>
      {#if context.hasChildren}
        <button tabindex="-1" aria-label="Toggle children" onclick={context.toggle}>Toggle</button>
      {/if}
      <button tabindex="-1" onclick={context.activate}>{value.name}</button>
      <button onclick={() => rename(value.id)}>Rename</button>
    </div>
  {/snippet}
</TreeView>
`;
