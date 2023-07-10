<script>
	import { goto } from '$app/navigation';
	import 'carbon-components-svelte/css/all.css';
	import { Theme, Button, Modal, TextInput, Search, ClickableTile } from 'carbon-components-svelte';
	import Add from 'carbon-icons-svelte/lib/Add.svelte';
	import * as JsSearch from 'js-search';
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
			goto(`/box/${id}`);
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
			<ClickableTile href="/box/{item.id}" style="margin-bottom: 1em;">
				<h2>{item.id}</h2>
				{item.content.replace(/\n/g, ', ')}
				{#each data.photos[item.id] as photo}
					<img src={photo} alt="o" style="width: 10vw" />
				{/each}
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
