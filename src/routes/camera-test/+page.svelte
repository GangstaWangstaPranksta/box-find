<script>
	import 'carbon-components-svelte/css/all.css';
	import Camera from 'carbon-icons-svelte/lib/Camera.svelte';
	import { Button, Theme } from 'carbon-components-svelte';
	/** @type {import('./$types').PageData} */
	export let data;
	let photos = [];
	let fileinput;
	const onFileSelected = (e) => {
		let image = e.target.files[0];
		let reader = new FileReader();
		reader.readAsDataURL(image);
		reader.onload = (e) => {
			photos = [...photos, e.target.result];
			/* console.log(e.target.result);
            let compressed = LZString.compress(e.target.result)
            let decompressd = LZString.decompress(compressed)
            console.log(compressed)
            console.log(decompressd) */
		};
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
<label for="cameraFileInput">
	<Button iconDescription="Take a picture" icon={Camera} on:click={fileinput.click()} />

	<!-- The hidden file `input` for opening the native camera -->
	<input
		id="cameraFileInput"
		type="file"
		accept="image/*"
		capture="environment"
		on:change={(e) => onFileSelected(e)}
		bind:this={fileinput}
	/>
</label>
<p></p>
{#each photos as photo}
	<img class="avatar" src={photo} alt="d" style="width:30vw"/>
{/each}

<style>
	#cameraFileInput {
		display: none;
	}
</style>
