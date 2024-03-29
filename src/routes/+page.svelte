<script>
	import { goto } from '$app/navigation';
	import 'carbon-components-svelte/css/g80.css';
	import { Theme, Button, Modal, TextInput, Search, ClickableTile, Truncate } from 'carbon-components-svelte';
	import Add from 'carbon-icons-svelte/lib/Add.svelte';
	import * as JsSearch from 'js-search';
	import { MasonryGrid } from '@egjs/svelte-grid';

	const align = 'start';
	const column = 0;
	const gap = 16;
	const defaultDirection = 'end';
	
	/** @type {import('./$types').PageData} */
	export let data;
	let showModal = false;
	let newBoxID = '';

	let searchQuery = '';

	let searchDoc = Object.keys(data.contents).map((key) => ({
		id: key,
		content: data.contents[key]
	}));

	var search = new JsSearch.Search('id');
	search.indexStrategy = new JsSearch.AllSubstringsIndexStrategy();
	search.addIndex('id');
	search.addIndex('content');

	search.addDocuments(searchDoc);

	let result;

	$: {
		if (searchQuery != '') {
			result = search.search(searchQuery);
		} else {
			result = searchDoc;
		}
	}

	const newBox = async (id) => {
		const res = await fetch('/api/newBox', {
			method: 'POST',
			body: JSON.stringify({ id }),
			headers: {
				'content-type': 'application/json'
			}
		});
		if ((await res.json()) == `${id} box created`) {
			goto(`/box/${encodeURIComponent(id)}`);
		}
	};
</script>

<svelte:head>
	<title>Home | Box Find</title>
</svelte:head>

<Theme
	theme="g80"
	tokens={{
		'interactive-01': data.primary,
		'hover-primary': data.hover,
		'active-primary': data.active
	}}
/>

<div class="wrapper">
	<div class="searchBar">
		<Search bind:value={searchQuery} />
		<span class="newBox">
			<Button
				on:click={() => {
					showModal = true;
				}}
				iconDescription="New Box"
				icon={Add}
			/>
		</span>
	</div>

	{#if result.length > 0}
		{#each result as item}
			<ClickableTile href="/box/{encodeURIComponent(item.id)}" style="margin-bottom: 1em;">
				<h2>{item.id}</h2>
				<Truncate>
					{item.content.replace(/\n/g, ', ')}
				</Truncate>
				{#if data.photos[item.id].length > 0}
					<div class="content" style="border-bottom:1px solid; margin:.75em 0 .75em 0;" />

					<h4>Pictures</h4>
					<MasonryGrid {defaultDirection} {gap} {align} {column}>
						{#each data.photos[item.id] as photo}
						<img src={photo} alt="o" style="min-width: 200px; width: 10vw" />
						{/each}
					</MasonryGrid>
				{/if}
			</ClickableTile>
		{/each}
	{:else}
		<h3>No results found for "{searchQuery}"</h3>
		<p>But here's a cookie! 🍪</p>
	{/if}
</div>

<Modal
	bind:open={showModal}
	modalHeading="Create a new Box"
	primaryButtonText="Create Box"
	secondaryButtonText="Cancel"
	on:click:button--secondary={() => (showModal = false)}
	on:click:button--primary={() => {
		newBox(newBoxID);
	}}
>
	<TextInput id="box-name" labelText="Box ID" placeholder="Enter box ID..." bind:value={newBoxID} />
</Modal>

<style>
	.wrapper {
		margin: 1.5em;
	}
	.searchBar {
		display: flex;
		margin-bottom: 1em;
	}
	.newBox {
		margin-left: 1em;
	}
</style>
