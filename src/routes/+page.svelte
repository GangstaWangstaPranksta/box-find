<script>
  import { goto } from '$app/navigation';
	import 'carbon-components-svelte/css/all.css';
	import { Theme, Button, Modal, TextInput, ToastNotification } from 'carbon-components-svelte';
  import Add from 'carbon-icons-svelte/lib/Add.svelte'
  /** @type {import('./$types').PageData} */
	export let data;
  let showModal = false;
  let newBoxID = ""; 
  let toasts = [];

  const newBox = async (id) =>{
    const res = await fetch('/api/newBox', {
			method: 'POST',
			body: JSON.stringify({ id }),
			headers: {
				'content-type': 'application/json'
			}
		});
		if ((await res.json()) == `${id} box created`) {
			goto(`/box/${id}`)
		}
  };
</script>

<Theme
	theme="g80"
	tokens={{
		'interactive-01': data.primary,
		'hover-primary': data.hover,
		'active-primary': data.active
	}}
/>
<!-- <h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p> -->

<Button on:click={()=>{goto("/box/582734")}}>
  Test Box Page
</Button>

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
<TextInput
    id="box-name"
    labelText="Box ID"
    placeholder="Enter box ID..."
    bind:value={newBoxID}
  />
</Modal>

<Button on:click={()=>{showModal = true}} iconDescription="Create a new Box" icon={Add} />

<div class="toasts">
	{#each toasts as toast}
		<ToastNotification
			kind="success"
			title="Uploaded"
			subtitle="Your images have been uploaded successfully."
			caption={new Date().toLocaleString()}
		/>
	{/each}
</div>

<style>
	.toasts{
		position: fixed;
		z-index: 1;
		bottom: 15px;
		right: 15px;
	}
</style>