<script lang="ts">
	import '../app.css';
	/** @type {import('./$types').LayoutData} */
	export let data;
</script>

{#if data.demoMode}
	<p class="demo-banner" role="status">This version is in demo mode. Edits are restricted.</p>
{/if}

<slot />

<style>
	.demo-banner {
		margin: 0;
		padding: 0.5rem 1.5rem;
		border-bottom: 1px solid hsl(var(--border));
		background: hsl(var(--muted));
		color: hsl(var(--muted-foreground));
		font-size: 0.875rem;
		line-height: 1.5rem;
	}
</style>
