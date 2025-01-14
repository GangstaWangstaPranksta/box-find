<script>
	import 'carbon-components-svelte/css/g80.css';
	import { Button, Modal, TextInput } from 'carbon-components-svelte';

	import { pushState } from '$app/navigation';
	import { page } from '$app/stores';
	import { replaceState } from '$app/navigation';

	let editBoxName = '';
	let modalShow = false;

	function showModal() {
		console.log('showModal called');
		modalShow = true;
		console.log('modalShow: ', modalShow);
		pushState('', {
			showModal: true
		});
	}

	function hideModal() {
		console.log('hideModal');
		replaceState('', {
			showModal: false
		});
		modalShow = false;
		console.log('backed, new page state: ', $page.state);
	}

	function renameBox() {
		console.log('renameBox: ', editBoxName);
	}

	$: {
		if (!modalShow) {
			if ($page.state?.showModal) {
				console.log('page state show modal is true');
				hideModal();
				//console.log('test');
			}
		}
	}

	$: {
		//handles page state update to false, updating modalShow
		console.log('page state: ', $page.state?.showModal);
		if (!$page.state?.showModal) {
			if (modalShow) {
				modalShow = false;
			}
		}
	}

	$: console.log('modalShow: ', modalShow);
</script>

<pre>
    {JSON.stringify($page, null, 2)}
    {modalShow}
</pre>

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
<Button
	on:click={() => {
		console.log('$page.state: ', $page.state);
		console.log('modalShow: ', modalShow);
	}}>Log state</Button
>

{#if modalShow}
	<p style="font-size:3em">modalshow</p>
{/if}

{#if $page.state.showModal}
	<p style="font-size:3em">page state show</p>
{/if}
