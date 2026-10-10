<script lang="ts">
	import InventoryPage from '$lib/components/InventoryPage.svelte';

	/** @type {import('./$types').PageData} */
	export let data;
</script>

<InventoryPage {data} currentPage={data.page} />
