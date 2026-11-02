<script lang="ts" generics="SingleNode extends object">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import {
		type BlurParams,
		type FadeParams,
		type FlyParams,
		type ScaleParams,
		type SlideParams,
		type TransitionConfig
	} from 'svelte/transition';

	import Self from './tree.svelte';
	import type { TreeData } from './tree.types';
	type ParamsType =
		FadeParams | BlurParams | FlyParams | SlideParams | ScaleParams | undefined;

	type TransitionFunc = (
		node: HTMLElement,
		params: ParamsType
	) => TransitionConfig;

	type Props = {
		tree: TreeData<SingleNode>;
		node: Snippet<[SingleNode]>;
		wrapperProps?: Record<string, unknown>;
		wrapperElement?: keyof HTMLElementTagNameMap;
		transition?: TransitionFunc;
		transitionParams?: ParamsType;
		transitionWrapperProps?: HTMLAttributes<HTMLDivElement>;
	};

	let {
		node,
		tree = $bindable<TreeData<SingleNode>>({}),
		wrapperProps,
		wrapperElement,
		transition,
		transitionParams,
		transitionWrapperProps
	}: Props = $props();
</script>

{#each Object.entries(tree) as [id, content] (id)}
	<!-- We cannot optionally pass a single attribute to a svelte:element, therefore we need to handle the transition attribute with a if/else statement-->
	{#if transition}
		<svelte:element
			this={wrapperElement ?? 'div'}
			{...wrapperProps}
			transition:transition|local={transitionParams}
		>
			{@render node(content)}

			{#if content.children && content.expanded}
				<div
					transition:transition|local={transitionParams}
					{...transitionWrapperProps}
				>
					<Self
						{node}
						bind:tree={content.children}
						{wrapperProps}
						{wrapperElement}
						{transition}
						{transitionParams}
						{transitionWrapperProps}
					/>
				</div>
			{/if}
		</svelte:element>
	{:else}
		<svelte:element this={wrapperElement ?? 'div'} {...wrapperProps}>
			{@render node(content)}

			{#if content.children && content.expanded}
				<Self
					{node}
					bind:tree={content.children}
					{wrapperProps}
					{wrapperElement}
				/>
			{/if}
		</svelte:element>
	{/if}
{/each}
