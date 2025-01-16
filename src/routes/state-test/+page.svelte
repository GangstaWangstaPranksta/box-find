<script>
	import 'carbon-components-svelte/css/g80.css';
	import { Button, Modal, TextInput } from 'carbon-components-svelte';

	import { pushState } from '$app/navigation';
	import { page } from '$app/stores';
	import { browser } from '$app/environment';

	let editBoxName = '';
	let modalShow = false;

	function showModal() {
		modalShow = true;
		pushState('', {
			showModal: true
		});
	}

	function hideModal() {
		history.back();
	}

	function renameBox() {
		//console.log('renameBox: ', editBoxName);
	}

	$: {
		//handle when modal changes state of modalShow
		if (!modalShow && browser && $page.state?.showModal) {
			hideModal();
		}
	}

	$: {
		//handles user browser back action
		if (!$page.state?.showModal) {
			modalShow = false;
		}
	}
</script>

<Modal
	bind:open={modalShow}
	modalHeading="New Box Name/ID"
	primaryButtonText="Change Box Name"
	secondaryButtonText="Cancel"
	selectorPrimaryFocus="#box-name"
	on:click:button--secondary={hideModal}
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

<Button
	on:click={() => {
		showModal();
	}}>Opem Modal</Button
>
