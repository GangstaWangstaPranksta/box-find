<script lang="ts">
	import type { HTMLTextareaAttributes } from 'svelte/elements';
	import type { TextareaEvents } from './index.js';
	import { cn } from '$lib/utils.js';

	type $$Props = HTMLTextareaAttributes;
	type $$Events = TextareaEvents;

	let className: $$Props['class'] = undefined;
	export let value: $$Props['value'] = undefined;
	export { className as class };

	// Workaround for https://github.com/sveltejs/svelte/issues/9305
	// Fixed in Svelte 5, but not backported to 4.x.
	export let readonly: $$Props['readonly'] = undefined;
</script>

<textarea
	class={cn(
		'border-input placeholder:text-muted-foreground flex min-h-[60px] w-full rounded-lg border bg-transparent px-3 py-2 text-sm shadow-sm outline-none focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
		className
	)}
	bind:value
	{readonly}
	on:blur
	on:change
	on:click
	on:focus
	on:keydown
	on:keypress
	on:keyup
	on:mouseover
	on:mouseenter
	on:mouseleave
	on:paste
	on:input
	{...$$restProps}></textarea>
