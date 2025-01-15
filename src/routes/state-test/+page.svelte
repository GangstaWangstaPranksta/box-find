<script>
	import 'carbon-components-svelte/css/g80.css';
	import { Button, Modal, TextInput } from 'carbon-components-svelte';

	import { pushState } from '$app/navigation';
	import { page } from '$app/stores';
	import { replaceState } from '$app/navigation';
	import { browser } from '$app/environment';

	let editBoxName = '';
	let modalShow = false;

	function showModal() {
		console.warn('showModal');
		modalShow = true;
		pushState('', {
			showModal: true
		});
	}

	function hideModal() {
		console.error('hideModal');
		logState();
		history.back();
	}

	function renameBox() {
		//console.log('renameBox: ', editBoxName);
	}

	function logState() {
		console.log('$page.state: ', $page.state);
		console.log('modalShow: ', modalShow);
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
		replaceState('', {
			showModal: false
		});
		showModal();
	}}>Opem Modal</Button
>
<Button on:click={hideModal}>hide Modal</Button>
<Button on:click={logState}>Log state</Button>
