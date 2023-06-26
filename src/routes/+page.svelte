<script>
  import { goto } from '$app/navigation';
	import 'carbon-components-svelte/css/all.css';
	import { Theme, Button } from 'carbon-components-svelte';
  /** @type {import('./$types').PageData} */
	export let data;
</script>

<Theme
	theme="g80"
	tokens={{
		'interactive-01': data.primary,
		'hover-primary': data.hover,
		'active-primary': data.active
	}}
/>
<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>

<Button on:click={()=>{goto("/box/582734")}}>
  Test Box Page
</Button>
