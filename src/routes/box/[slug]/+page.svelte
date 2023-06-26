<script>
  import { goto } from '$app/navigation';
	import 'carbon-components-svelte/css/g80.css';
	import { Theme, TextArea, Button, ButtonSet, Modal } from 'carbon-components-svelte';
	import Save from 'carbon-icons-svelte/lib/Save.svelte';
	/** @type {import('./$types').PageData} */
	export let data;
	let contents = '';
  let modalOpen = false;
  const openModal = ()=>{
    modalOpen = true;
  }
</script>
<svelte:head>
	<title>Box {data.box}</title>
</svelte:head>

<Theme
	theme="g80"
	tokens={{
		'interactive-01': '#996600',
		'hover-primary': '#ab7a1a',
		'active-primary': '#6e4c09'
	}}
/>

<h1>Box: {data.box}</h1>
<TextArea
	labelText="Box Contents"
	placeholder="List box items seprated by a new line..."
	bind:value={contents}
/>

<ButtonSet>
	<Button kind="secondary" on:click={openModal}>Cancel</Button>
	<Button icon={Save}>Save</Button>
</ButtonSet>

<Modal
  danger
  bind:open={modalOpen}
  modalHeading="Exit without saving?"
  primaryButtonText="Exit"
  secondaryButtonText="Go Back"
  on:click:button--secondary={() => (modalOpen = false)}
  on:click:button--primary={() => {goto("/")}}
  
>
  <p>You have unsaved data</p>
</Modal>
