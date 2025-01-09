<script>
	import { goto, replaceState } from '$app/navigation';
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { quintIn, quintOut } from 'svelte/easing';
	import 'carbon-components-svelte/css/g80.css';
	import {
		Button,
		Modal,
		TextInput,
		Search,
		ClickableTile,
		Truncate,
		PaginationNav,
		ProgressBar,
		ToastNotification
	} from 'carbon-components-svelte';
	import Add from 'carbon-icons-svelte/lib/Add.svelte';
	import { MasonryGrid } from '@egjs/svelte-grid';

	const align = 'start';
	const column = 0;
	const gap = 16;
	const defaultDirection = 'end';

	/** @type {import('./$types').PageData} */
	export let data;
	let pageNum = 1;
	let lastPage = data.lastPage;
	let showModal = false;
	let newBoxID = '';

	let searchQuery = '';
	let searchedQuery = '';
	let results = [];
	let fromEmptySearch = true;
	let searching = false;
	let status = 'finished';

	//search stuff

	let oldSearchQuery = searchQuery;

	let toasts = [];

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
					fromEmptySearch = false;
					status = 'finished';
					searchedQuery = searchQuery;
				})();
			} else {
				//results = [];
				$page.url.searchParams.delete('query');
				replaceState($page.url, {});
				fromEmptySearch = true;
			}
			oldSearchQuery = searchQuery;
		}
	}

	//if query is in url, set searchQuery to it on mount
	onMount(() => {
		if ($page.url.searchParams.has('query')) {
			searchQuery = $page.url.searchParams.get('query');
			searching = true;
			status = 'active';
			(async () => {
				const res = await fetch(`/api/search/2?query=${encodeURIComponent(searchQuery)}`);
				results = await res.json();
				searching = false;
				status = 'finished';
				fromEmptySearch = false;
				searchedQuery = searchQuery;
			})();
		}
	});

	//pagination stuff
	$: {
		if (browser) {
			if (pageNum != 1) {
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
		const resJson = await res.json();
		console.log(resJson);
		if (res.status != 409 && resJson.id == id) {
			goto(`/box/${encodeURIComponent(id)}`);
		} else if (res.status == 409) {
			showModal = false;
			addToast('error', 'Error creating a new box', `A box with id: "${id}" already exists.`);
		} else {
			showModal = false;
			addToast('error', 'Error creating a new box', `An unknown error occurred.`);
		}
	};

	const addToast = (kind, title, subtitle) => {
		toasts = [...toasts, { kind, title, subtitle, date: new Date(), timeoutId: null }];
		toasts = toasts.map((toast) => {
			toast.timeoutId = setTimeout(() => {
				toasts = toasts.filter((t) => t !== toast);
			}, 10000); // 10 seconds
			return toast;
		});
	};

	const composeImageAltText = (id) => {
		return `Picture of "${id}'s" contents`;
	};
</script>

<svelte:head>
	<title>Home | Box Find</title>
</svelte:head>

<div class="wrapper">
	<div class="searchBar">
		<span>
			<Search bind:value={searchQuery} />
			<ProgressBar size="sm" kind="inline" {status} hideLabel="true" />
		</span>

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

	{#if searchQuery == '' || (searching && fromEmptySearch)}
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
							<img
								src={photo}
								alt={composeImageAltText(item._id)}
								style="min-width: 200px; width: 10vw; max-height: 350px;"
							/>
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
							<img
								src={photo}
								alt={composeImageAltText(item.item._id)}
								style="min-width: 200px; width: 10vw; max-height: 350px;"
							/>
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
	on:click:button--secondary={() => (showModal = false)((newBoxID = ''))}
	on:click:button--primary={() => {
		if (newBoxID != '') {
			newBox(newBoxID);
			newBoxID = '';
		}
	}}
>
	<TextInput id="box-name" labelText="Box ID" placeholder="Enter box ID..." bind:value={newBoxID} />
</Modal>

<div class="toasts">
	{#each toasts as toast}
		<div
			class="toast"
			in:fade={{ duration: 250, easing: quintIn }}
			out:fade={{ duration: 500, easing: quintOut }}
		>
			<ToastNotification
				kind={toast.kind}
				title={toast.title}
				subtitle={toast.subtitle}
				caption={toast.date.toLocaleString()}
				lowContrast
			/>
		</div>
	{/each}
</div>

<style>
	.toasts {
		position: fixed;
		z-index: 1;
		bottom: 15px;
		right: 15px;
	}
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
