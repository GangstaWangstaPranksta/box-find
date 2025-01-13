<script>
	import 'carbon-components-svelte/css/g80.css';
	import { Button, Modal, TextInput } from 'carbon-components-svelte';
	import Exit from 'carbon-icons-svelte/lib/Exit.svelte';

	import { pushState } from '$app/navigation';
	import { page } from '$app/stores';
	import { replaceState } from '$app/navigation';

	let editBoxName = '';

	function showModal() {
		pushState('', {
			showModal: true
		});
	}

	function hideModal() {
		replaceState('', {});
	}

	function renameBox() {
		console.log('renameBox', editBoxName);
	}

	let modalShow = true;

	$: {
		if (!modalShow) {
			hideModal();
			modalShow = true;
		}
	}
</script>

<pre>
    {JSON.stringify($page, null, 2)}
    {modalShow}
</pre>

{#if $page.state.showModal}
	<Modal
		bind:open={modalShow}
		modalHeading="New Box Name/ID"
		primaryButtonText="Change Box Name"
		secondaryButtonText="Cancel"
		selectorPrimaryFocus="#box-name"
		on:click:button--secondary={() => hideModal()}
		on:click:button--primary={() => {
			renameBox();
		}}
		on:close={() => hideModal()}
	>
		<p>Any unsaved changed will be discarded.</p>
		<TextInput
			id="box-name"
			labelText="Box ID"
			placeholder="Enter box ID..."
			bind:value={editBoxName}
		/>
	</Modal>
{/if}

<Button on:click={showModal}>Opem Modal</Button>
<Button on:click={hideModal}>hide Modal</Button>
