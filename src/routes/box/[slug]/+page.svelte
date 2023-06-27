<script>
	import { goto } from '$app/navigation';
	import 'carbon-components-svelte/css/all.css';
	import { Theme, TextArea, Button, ButtonSet, Modal, ToastNotification } from 'carbon-components-svelte';
	import Save from 'carbon-icons-svelte/lib/Save.svelte';
	/** @type {import('./$types').PageData} */
	export let data;
  let id = data.box;
  let contents = data.contents
  let savedContents = data.contents
	let modalOpen = false;
  let toasts = [];
	const openModal = () => {
    if(savedContents != contents){
		  modalOpen = true;
    }else{
      goto("/");
    }
	};
  const save = async () =>{
    const res = await fetch('/api/save', {
            method: 'POST',
            body: JSON.stringify({ id , contents }),
            headers: {
                'content-type': 'application/json'
            }
        });
      if(await res.json() == 'saved'){
        toasts = [...toasts, ""]
      }
  }
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

<h1>Box: {data.box}</h1>
<TextArea
	labelText="Box Contents"
	placeholder="List box items seprated by a new line..."
	bind:value={contents}
/>
<ButtonSet>
	<Button kind="secondary" on:click={openModal}>Cancel</Button>
	<Button icon={Save} on:click={save}>Save</Button>
</ButtonSet>

<Modal
danger
bind:open={modalOpen}
modalHeading="Exit without saving?"
primaryButtonText="Exit"
secondaryButtonText="Go Back"
on:click:button--secondary={() => (modalOpen = false)}
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
  subtitle= "Your changes have been saved."
  caption={new Date().toLocaleString()}
  />
  {/each}
</div>

</div>

<style>
  .wrapper{
    margin: 1.5em;
  }
  .toasts{
    position:fixed;
    z-index: 1;
    bottom: 15px;
    right: 15px;
  }
</style>