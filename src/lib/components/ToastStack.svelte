<script lang="ts">
	import ToastMessage from './ToastMessage.svelte';
	import type { toastData } from '$lib/types/types';

	export let toasts: toastData[] = [];
</script>

<div class="fixed bottom-4 right-4 z-[70] flex flex-col gap-2" aria-live="polite">
	{#each toasts as toast (toast)}
		<ToastMessage
			{toast}
			on:dismiss={(event) => (toasts = toasts.filter((item) => item !== event.detail))}
		/>
	{/each}
</div>
