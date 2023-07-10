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
	import Camera from 'carbon-icons-svelte/lib/Camera.svelte';
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
	let photos = data.images;
	let delPhotos = [];
	let newPhotos = [];
	let fileinput;

	const onFileSelected = (e) => {
		let image = e.target.files[0];
		let reader = new FileReader();
		reader.readAsDataURL(image);
		reader.onload = (e) => {
			photos = [...photos, e.target.result];
			newPhotos = [...newPhotos, e.target.result];
		};
	};

	const openCancelModal = () => {
		if (initContents != contents || newPhotos.length > 0 || delPhotos.length > 0) {
			cancelModalOpen = true;
		} else {
			goto('/');
		}
	};
	const save = async () => {
		let contentsSave = '';
		let imgSave = '';
		let imgDel = '';
		if (initContents != contents) {
			const res = await fetch('/api/saveContent', {
				method: 'POST',
				body: JSON.stringify({ id, contents }),
				headers: {
					'content-type': 'application/json'
				}
			});
			contentsSave = await res.json();
			initContents = contents;
		}
		if (newPhotos.length > 0) imgSave = await saveImgs();
		if (delPhotos.length > 0) imgDel = await saveDelImg();

		console.log([contentsSave, imgSave, imgDel]);
		if (contentsSave == 'saved' || imgSave == 'saved' || imgDel == 'saved') {
			toasts = [...toasts, ''];
		}
	};
	const uploadImg = async (base64) => {
		const res = await fetch('/api/saveImage', {
			method: 'POST',
			body: JSON.stringify({ id, base64 }),
			headers: {
				'content-type': 'application/json'
			}
		});
		return res.json();
	};
	const saveImgs = async () => {
		if (newPhotos.length > 0) {
			//loadingStatus = "active";
			await Promise.all(newPhotos.map((photo) => uploadImg(photo)));
			//console.log(values)
			newPhotos = [];
			//loadingStatus = "finished";
			return 'saved';
		}
		return '';
	};
	const unUploadImg = async (base64) => {
		const res = await fetch('/api/delImage', {
			method: 'POST',
			body: JSON.stringify({ id, base64 }),
			headers: {
				'content-type': 'application/json'
			}
		});
		return res.json();
	};
	const saveDelImg = async () => {
		if (delPhotos.length > 0) {
			await Promise.all(delPhotos.map((photo) => unUploadImg(photo)));
			delPhotos = [];
			return 'saved';
		}
		return '';
	};
	const delBox = async () => {
		const res = await fetch('/api/deleteBox', {
			method: 'POST',
			body: JSON.stringify({ id }),
			headers: {
				'content-type': 'application/json'
			}
		});
		if ((await res.json()) == `${id} box deleted`) {
			goto(`/`);
		}
	};
	const renameBox = async () => {
		const res = await fetch('/api/renameBox', {
			method: 'POST',
			body: JSON.stringify({ id, editBoxName }),
			headers: {
				'content-type': 'application/json'
			}
		});
		if ((await res.json()) == `${id} box renamed to ${editBoxName}`) {
			goto(`/box/${editBoxName}`);
			id = editBoxName;
			editModalOpen = false;
		}
	};
	const splicePhoto = (index) => {
		let isNewPhoto = false;
		newPhotos = newPhotos.filter((photo) => {
			photo !== photos[index];
			isNewPhoto = true;
		});
		if (!isNewPhoto) delPhotos = [...delPhotos, photos[index]];
		photos.splice(index, 1);
		photos = [...photos];
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
			<Button
				kind="tertiary"
				iconDescription="Edit"
				icon={Edit}
				on:click={() => {
					editModalOpen = true;
				}}
			/>
			<Button
				kind="danger-tertiary"
				iconDescription="Delete"
				icon={TrashCan}
				on:click={() => {
					deleteModalOpen = true;
				}}
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
			<Button icon={Camera} on:click={fileinput.click()}>Add Photo</Button>
			<!-- hidden input -->
			<input
				type="file"
				accept="image/*"
				capture="environment"
				on:change={(e) => onFileSelected(e)}
				bind:this={fileinput}
				style="display:none;"
			/>
			<p />
			<span class="imgWrapper">
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
			</span>
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
		min-width: 30em;
		max-width: 18vw;
		padding: 0.5em 0.5em 0 0;
	}
	.imgWrapper {
		display: inline-flex;
		flex-wrap: wrap;
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
			max-width: 90vw;
		}
	}
</style>
