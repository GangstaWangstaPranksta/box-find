<script lang="ts">
	import Grid from '@egjs/svelte-grid/src/Grid.svelte';
	import { MasonryGrid } from '@egjs/grid';
</script>

<!-- Bypass the library's legacy class wrapper so Svelte 5 compiles the component. -->
<Grid GridClass={MasonryGrid} {...$$restProps}>
	<slot />
</Grid>
