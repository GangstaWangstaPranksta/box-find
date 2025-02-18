<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { goto, invalidateAll, pushState } from '$app/navigation';
	import { fade } from 'svelte/transition';
	import 'carbon-components-svelte/css/g80.css';
	import {
		TextArea,
		Button,
		Modal,
		ToastNotification,
		TextInput,
		InlineLoading
	} from 'carbon-components-svelte';
	import Save from 'carbon-icons-svelte/lib/Save.svelte';
	import Exit from 'carbon-icons-svelte/lib/Exit.svelte';
	import Edit from 'carbon-icons-svelte/lib/Edit.svelte';
	import TrashCan from 'carbon-icons-svelte/lib/TrashCan.svelte';
	import Camera from 'carbon-icons-svelte/lib/Camera.svelte';
	import Home from 'carbon-icons-svelte/lib/Home.svelte';
	import Add from 'carbon-icons-svelte/lib/Add.svelte';

	import { MasonryGrid } from '@egjs/svelte-grid';

	import type { toastData, toastType } from '$lib/types/types';

	/** @type {import('./$types').PageData} */
	export let data;

	const align = 'start';
	const column = 0;
	const gap = 16;
	const defaultDirection = 'end';

	let id = data.box;
	let contents = data.contents;
	let initContents = data.contents;
	let toasts: toastData[] = [];
	let photos = data.images;
	let delPhotos: string[] = [];
	let newPhotos: string[] = [];
	let fileinput: HTMLInputElement;
	let saving = false;

	const onFileSelected = (e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
		const target = e.target as HTMLInputElement;

		if (target.files && target.files.length > 0) {
			const image = target.files[0];
			const reader = new FileReader();

			reader.readAsDataURL(image);
			reader.onload = (event) => {
				if (event.target && event.target.result) {
					photos = [...photos, event.target.result as string];
					newPhotos = [...newPhotos, event.target.result as string];
				}
			};
		}
	};

	const save = async () => {
		let contentsSave = false;
		let imgSave: number | null = 0;
		let imgDel: number | null = 0;
		let error;
		saving = true;
		if (initContents != contents) {
			const res = await fetch('/api/saveContent', {
				method: 'PATCH',
				body: JSON.stringify({ id, contents }),
				headers: {
					'content-type': 'application/json'
				}
			});
			if (!res.ok) {
				addToast(
					'error',
					'Oops, something went wrong.',
					`An error occured, status: ${res.status}.`
				);
			} else {
				contentsSave = true;
				initContents = contents;
			}
		}
		if (newPhotos.length > 0) imgSave = await saveImgs();
		if (delPhotos.length > 0) imgDel = await saveDelImg();
		if (contentsSave || imgSave != null || imgDel != null) {
			addToast('success', 'Success!', 'Changes have been saved.');
		} else {
			addToast('error', 'Oops, something went wrong.', `An error occured, status: ${error}.`);
		}
		saving = false;
	};

	const uploadImg = async (base64: string) => {
		const res = await fetch('/api/saveImage', {
			method: 'PATCH',
			body: JSON.stringify({ id, base64 }),
			headers: {
				'content-type': 'application/json'
			}
		});
		if (res.ok) return true;
		else return res.status;
	};
	const saveImgs = async () => {
		let values = await Promise.all(newPhotos.map((photo) => uploadImg(photo)));
		newPhotos = [];

		if (values.length === 0) {
			return 0;
		}

		if (values.every((value) => value === true)) {
			return values.length;
		} else {
			const firstFailure = values.find((value) => value !== true);
			return firstFailure !== undefined ? firstFailure : null;
		}
	};
	const unUploadImg = async (base64: string) => {
		const res = await fetch('/api/delImage', {
			method: 'PATCH',
			body: JSON.stringify({ id, base64 }),
			headers: {
				'content-type': 'application/json'
			}
		});
		if (res.ok) return true;
		else return res.status;
	};
	const saveDelImg = async () => {
		if (delPhotos.length > 0) {
			let values = await Promise.all(delPhotos.map((photo) => unUploadImg(photo)));
			delPhotos = [];

			if (values.length === 0) {
				return 0;
			}

			if (values.every((value) => value === true)) {
				return values.length;
			} else {
				const firstFailure = values.find((value) => value !== true);
				return firstFailure !== undefined ? firstFailure : null;
			}
		}

		return 0;
	};

	const delBox = async () => {
		const res = await fetch('/api/deleteBox', {
			method: 'DELETE',
			body: JSON.stringify({ id }),
			headers: {
				'content-type': 'application/json'
			}
		});
		const resJson = await res.json();
		if (res.ok && resJson.status == 'ok') {
			addToast('success', 'Box Deleted.', `${id} box deleted.`);
			goto(`/`);
		} else if (res.status == 404) {
			addToast('error', 'Box not found.', `Box with id: ${id} was not found.`);
		} else {
			addToast('error', 'Oops, something went wrong.', `An error occured. "${resJson.error}"`);
		}
	};
	const renameBox = async () => {
		const res = await fetch('/api/renameBox', {
			method: 'PATCH',
			body: JSON.stringify({ id, editBoxName }),
			headers: {
				'content-type': 'application/json'
			}
		});
		const resJson = await res.json();
		if (resJson?.newID == editBoxName && res.ok) {
			goto(`/box/${editBoxName}`);
			id = editBoxName;
		} else {
			addToast('error', 'Oops, something went wrong.', `An error occured, status: ${res.status}.`);
		}
	};
	const splicePhoto = (index: number) => {
		let isNewPhoto = false;
		newPhotos = newPhotos.filter((photo) => {
			photo !== photos[index];
			isNewPhoto = true;
		});
		if (!isNewPhoto) delPhotos = [...delPhotos, photos[index]];
		photos.splice(index, 1);
		photos = [...photos];
	};
	const newBox = async () => {
		const res = await fetch('/api/newBox', {
			method: 'POST',
			body: JSON.stringify({ id }),
			headers: {
				'content-type': 'application/json'
			}
		});
		if ((await res.json()) == `${id} box created`) {
			invalidateAll();
			initContents = '';
			contents = '';
		}
	};

	const addToast = (type: toastType, title: string, subtitle: string) => {
		toasts = [
			...toasts,
			{ type, title, subtitle, caption: new Date().toLocaleString(), timeout: 5000 }
		];
	};

	// modal management
	let cancelModalOpen = false;
	let deleteModalOpen = false;
	let editModalOpen = false;
	let editBoxName = id;

	function openCancelModal() {
		if (initContents != contents || newPhotos.length > 0 || delPhotos.length > 0) {
			cancelModalOpen = true;
			pushState('', {
				cancelModal: true
			});
		} else {
			if (browser) window.history.back();
		}
	}
	function openDeleteModal() {
		deleteModalOpen = true;
		pushState('', {
			deleteModal: true
		});
	}
	function openEditModal() {
		editModalOpen = true;
		pushState('', {
			editModal: true
		});
	}

	function closeModal() {
		history.back();
	}

	//handle when modal changes state of modalShow
	$: {
		if (!cancelModalOpen && browser && $page.state?.cancelModal) {
			closeModal();
		}
	}
	$: {
		if (!deleteModalOpen && browser && $page.state?.deleteModal) {
			closeModal();
		}
	}
	$: {
		if (!editModalOpen && browser && $page.state?.editModal) {
			closeModal();
		}
	}
	//handles user browser back action
	$: {
		if (!$page.state?.cancelModal) {
			cancelModalOpen = false;
		}
	}
	$: {
		if (!$page.state?.deleteModal) {
			deleteModalOpen = false;
		}
	}
	$: {
		if (!$page.state?.editModal) {
			editModalOpen = false;
		}
	}
</script>

<svelte:head>
	<title>Box: {data.box} | Box Find</title>
</svelte:head>

<div class="wrapper">
	{#if data.boxExist}
		<div class="header">
			<h1>Box: {data.box}</h1>
			<div class="boxEditButtons">
				<Button kind="tertiary" iconDescription="Edit" icon={Edit} on:click={openEditModal} />
				<Button
					kind="danger-tertiary"
					iconDescription="Delete"
					icon={TrashCan}
					on:click={openDeleteModal}
				/>
			</div>
		</div>
		<div class="editables">
			<div class="textBox">
				<TextArea
					labelText="Box Contents"
					placeholder="List box items seprated by a new line..."
					bind:value={contents}
				/>
			</div>

			<div class="images">
				<Button icon={Camera} on:click={() => fileinput.click()} style="margin-bottom: 1em"
					>Add Photo</Button
				>
				<!-- hidden input -->
				<input
					type="file"
					accept=".png, .jpeg, .webp, .gif, .tiff, .jpg"
					capture="environment"
					on:change={(e) => onFileSelected(e)}
					bind:this={fileinput}
					style="display:none;"
				/>
				<p />
				<span class="imgWrapper">
					<MasonryGrid {defaultDirection} {gap} {align} {column}>
						{#each photos as photo, index}
							<span class="imgStack">
								<span class="btnWrapper" style="padding-top:1em; padding-right:1em;">
									<Button
										kind="danger-tertiary"
										iconDescription="Delete"
										icon={TrashCan}
										on:click={() => {
											splicePhoto(index);
										}}
									/>
								</span>

								<img src={photo} alt="img" />
							</span>
						{/each}
					</MasonryGrid>
				</span>
			</div>
		</div>

		<div class="buttons" style="position: sticky; bottom: 1.5em">
			<Button icon={Exit} kind="secondary" on:click={openCancelModal}>Exit</Button>
			<Button
				icon={Save}
				on:click={save}
				disabled={!(initContents != contents || newPhotos.length > 0 || delPhotos.length > 0) ||
					saving}
			>
				{#if saving}
					<InlineLoading description="Saving..." status="active" />
				{:else}
					Save
				{/if}
			</Button>
		</div>

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
			selectorPrimaryFocus="#box-name"
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
				<div class="toast" transition:fade>
					<ToastNotification
						kind={toast.type}
						title={toast.title}
						subtitle={toast.subtitle}
						caption={toast.caption}
						timeout={toast.timeout}
						lowContrast
					/>
				</div>
			{/each}
		</div>
	{:else}
		<h1 style="padding-bottom:1em">The box "{id}" does not yet exist. Would you like it to?</h1>
		<Button
			icon={Home}
			kind="secondary"
			on:click={() => {
				goto(`/`);
			}}>Go Home</Button
		>
		<Button icon={Add} on:click={newBox}>Create Box</Button>
	{/if}
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
		justify-content: space-between;
		flex-direction: row;
	}
	.editables > * {
		flex: 1;
	}
	.images {
		margin-top: 24px;
		margin-left: 1em;
	}
	img {
		/* min-width: 24em; */
		/* max- */
		width: 40em;
	}
	.imgStack {
		display: grid;
		width: fit-content;
	}
	.imgStack > * {
		grid-area: 1/1;
		justify-self: end;
	}
	@media (max-width: 1024px) {
		.wrapper {
			margin: 1em;
		}
		.editables {
			flex-direction: column;
		}
		.images {
			margin-left: 0;
		}
		img {
			max-width: 92vw;
		}
	}
</style>
