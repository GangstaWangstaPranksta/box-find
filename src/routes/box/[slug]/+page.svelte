<script>
	import { goto } from '$app/navigation';
	import 'carbon-components-svelte/css/all.css';
	import {
		Theme,
		TextArea,
		Button,
		Modal,
		ToastNotification,
		TextInput
	} from 'carbon-components-svelte';
	import Save from 'carbon-icons-svelte/lib/Save.svelte';
	import Exit from 'carbon-icons-svelte/lib/Exit.svelte';
	import Edit from 'carbon-icons-svelte/lib/Edit.svelte';
	import TrashCan from 'carbon-icons-svelte/lib/TrashCan.svelte';
	/** @type {import('./$types').PageData} */
	export let data;
	let id = data.box;
	let contents = data.contents;
	let initContents = data.contents;
	let cancelModalOpen = false;
	let editModalOpen = false;
	let editBoxName = id;
	let deleteModalOpen = false;
	let toasts = [];
	const openCancelModal = () => {
		if (initContents != contents) {
			cancelModalOpen = true;
		} else {
			goto('/');
		}
	};
	const save = async () => {
		const res = await fetch('/api/save', {
			method: 'POST',
			body: JSON.stringify({ id, contents }),
			headers: {
				'content-type': 'application/json'
			}
		});
		if ((await res.json()) == 'saved') {
			initContents = contents;
			toasts = [...toasts, ''];
		}
	};
	const delBox = async () =>{
    const res = await fetch('/api/deleteBox', {
			method: 'POST',
			body: JSON.stringify({ id }),
			headers: {
				'content-type': 'application/json'
			}
		});
		if ((await res.json()) == `${id} box deleted`) {
			goto(`/`)
		}
  };
	const renameBox = async () =>{
    const res = await fetch('/api/renameBox', {
			method: 'POST',
			body: JSON.stringify({ id, editBoxName }),
			headers: {
				'content-type': 'application/json'
			}
		});
		if ((await res.json()) == `${id} box renamed to ${editBoxName}`) {
			goto(`/box/${editBoxName}`)
			id = editBoxName;
			editModalOpen = false;
		}
  };
</script>

<svelte:head>
	<title>Box {data.box}</title>
</svelte:head>
<div class="wrapper">
	<Theme
		theme="g80"
		tokens={{
			'interactive-01': data.primary,
			'hover-primary': data.hover,
			'active-primary': data.active
		}}
	/>
	<div class="header">
		<h1>Box: {data.box}</h1>
		<div class="boxEditButtons">
			<Button kind="tertiary" iconDescription="Edit" icon={Edit} on:click={()=>{editModalOpen = true;}}/>
			<Button kind="danger-tertiary" iconDescription="Delete" icon={TrashCan} on:click={()=>{deleteModalOpen = true;}}/>
		</div>
	</div>
	<div class="editables">
		<TextArea
			labelText="Box Contents"
			placeholder="List box items seprated by a new line..."
			bind:value={contents}
		/>

		<div class="images">
			<h1>wow images or smth</h1>
		</div>
	</div>

	<Button icon={Exit} kind="secondary" on:click={openCancelModal}>Exit</Button>
	<Button icon={Save} on:click={save}>Save</Button>

	<Modal
		danger
		bind:open={deleteModalOpen}
		modalHeading="Delete this box?"
		primaryButtonText="Delete"
		secondaryButtonText="Cancel"
		on:click:button--secondary={() => (deleteModalOpen = false)}
		on:click:button--primary={() => {
			delBox();
		}}
	>
		<p>All data associated with this box will be deleted. This can not be reversed</p>
	</Modal>
	<Modal
		bind:open={editModalOpen}
		modalHeading="New Box Name/ID"
		primaryButtonText="Change Box Name"
		secondaryButtonText="Cancel"
		on:click:button--secondary={() => (editModalOpen = false)}
		on:click:button--primary={() => {
			renameBox();
		}}
	>
	<p>Any unsaved changed will be discarded.</p>
		<TextInput
		id="box-name"
		labelText="Box ID"
		placeholder="Enter box ID..."
		bind:value={editBoxName}
	/>
	</Modal>
	<Modal
		danger
		bind:open={cancelModalOpen}
		modalHeading="Exit without saving?"
		primaryButtonText="Exit"
		secondaryButtonText="Go Back"
		on:click:button--secondary={() => (cancelModalOpen = false)}
		on:click:button--primary={() => {
			goto('/');
		}}
	>
		<p>You have unsaved data</p>
	</Modal>
	<div class="toasts">
		{#each toasts as toast}
			<ToastNotification
				kind="success"
				title="Success"
				subtitle="Your changes have been saved."
				caption={new Date().toLocaleString()}
			/>
		{/each}
	</div>
</div>

<style>
	.wrapper {
		margin: 1.5em;
	}
	.header {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
	}
	.boxEditButtons {
		flex: none;
	}
	.toasts {
		position: fixed;
		z-index: 1;
		bottom: 15px;
		right: 15px;
	}
	.editables {
		display: flex;
		flex-direction: row;
	}
	.editables > * {
		flex: 1;
	}
	/* .editables *{
		padding-inline: 3em;
	} */
	@media (max-width: 1024px) {
		.wrapper {
			margin: 1em;
		}
		.editables {
			flex-direction: column;
		}
	}
</style>
