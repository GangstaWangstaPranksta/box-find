declare module '@egjs/svelte-grid/src/Grid.svelte' {
	import type { SvelteComponent } from 'svelte';
	import type { MasonryGrid, MasonryGridOptions } from '@egjs/grid';

	export default class Grid extends SvelteComponent<
		MasonryGridOptions & { GridClass: typeof MasonryGrid }
	> {}
}
