<script>
	import { goto, replaceState } from '$app/navigation';
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import 'carbon-components-svelte/css/g80.css';
	import {
		Button,
		Modal,
		TextInput,
		Search,
		ClickableTile,
		Truncate,
		PaginationNav,
		ProgressBar
	} from 'carbon-components-svelte';
	import Add from 'carbon-icons-svelte/lib/Add.svelte';
	import { MasonryGrid } from '@egjs/svelte-grid';

	const align = 'start';
	const column = 0;
	const gap = 16;
	const defaultDirection = 'end';

	/** @type {import('./$types').PageData} */
	export let data;
	let pageNum = data.page;
	let lastPage = data.lastPage;
	let showModal = false;
	let newBoxID = '';

	let searchQuery = '';
	let searchedQuery = '';
	let results = [];
	let fromNoSearch = true;
	let searching = false;
	let status = 'finished';

	//search stuff

	let oldSearchQuery = searchQuery;

	$: {
		if (searchQuery !== oldSearchQuery) {
			if (searchQuery != '') {
				searching = true;
				status = 'active';
				(async () => {
					$page.url.searchParams.set('query', searchQuery);
					replaceState($page.url, {});
					const res = await fetch(`/api/search/2?query=${encodeURIComponent(searchQuery)}`);
					results = await res.json();
					searching = false;
					fromNoSearch = false;
					status = 'finished';
					searchedQuery = searchQuery;
				})();
			} else {
				//results = [];
				$page.url.searchParams.delete('query');
				replaceState($page.url, {});
				fromNoSearch = true;
			}
			oldSearchQuery = searchQuery;
		}
	}

	//if query is in url, set searchQuery to that
	onMount(() => {
		if ($page.url.searchParams.has('query')) {
			searchQuery = $page.url.searchParams.get('query');
			searching = true;
			status = 'active';
			(async () => {
				const res = await fetch(`/api/search/2?query=${encodeURIComponent(searchQuery)}`);
				results = await res.json();
				searching = false;
				fromNoSearch = false;
				status = 'finished';
				searchedQuery = searchQuery;
			})();
		}
	});

	$: {
		if (browser) {
			if (pageNum != data.page) {
				goto(`/page/${pageNum}`);
			}
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

<div class="wrapper">
	<div class="searchBar">
		<Search bind:value={searchQuery} />
		<ProgressBar size="sm" kind="inline" {status} hideLabel="true" />
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

	{#if searchQuery == '' || (searching && fromNoSearch)}
		<!-- default home page -->
		<!-- likely will change searching behavior -->
		{#each data.contents as item}
			<ClickableTile href="/box/{encodeURIComponent(item._id)}" style="margin-bottom: 1em;">
				<h2>{item._id}</h2>
				<Truncate>
					{item.contents.replace(/\n/g, ', ')}
				</Truncate>
				{#if item.images.length > 0}
					<div class="content" style="border-bottom:1px solid; margin:.75em 0 .75em 0;" />

					<h4>Pictures</h4>
					<MasonryGrid {defaultDirection} {gap} {align} {column}>
						{#each item.images as photo}
							<img src={photo} alt="o" style="min-width: 200px; width: 10vw; max-height: 350px;" />
						{/each}
					</MasonryGrid>
				{/if}
			</ClickableTile>
		{/each}
		<div style="display:flex; justify-content:center; align-items:center;">
			<PaginationNav total={lastPage} tooltipPosition="top" bind:page={pageNum} />
		</div>
	{:else if results.length > 0 || (searching && results.length > 0)}
		<!-- search results -->
		{#each results as item}
			<ClickableTile href="/box/{encodeURIComponent(item.item._id)}" style="margin-bottom: 1em;">
				<h2>{item.item._id}</h2>
				<Truncate>
					{item.item.contents.replace(/\n/g, ', ')}
				</Truncate>
				{#if item.item.images.length > 0}
					<div class="content" style="border-bottom:1px solid; margin:.75em 0 .75em 0;" />

					<h4>Pictures</h4>
					<MasonryGrid {defaultDirection} {gap} {align} {column}>
						{#each item.item.images as photo}
							<img src={photo} alt="o" style="min-width: 200px; width: 10vw; max-height: 350px;" />
						{/each}
					</MasonryGrid>
				{/if}
			</ClickableTile>
		{/each}
		{#if searchQuery == ''}
			<!-- only show paginationnav when not searching -->
			<div style="display:flex; justify-content:center; align-items:center;">
				<PaginationNav total={lastPage} tooltipPosition="top" bind:page={pageNum} />
			</div>
		{/if}
	{:else}
		<h3>No results found for "{searchedQuery}"</h3>
		<p>But here's a cookie! 🍪</p>
	{/if}
</div>

<Modal
	bind:open={showModal}
	modalHeading="Create a new Box"
	primaryButtonText="Create Box"
	selectorPrimaryFocus="#box-name"
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
	.searchBar > :first-child {
		flex-grow: 1;
	}
	.newBox {
		margin-left: 1em;
	}
</style>
