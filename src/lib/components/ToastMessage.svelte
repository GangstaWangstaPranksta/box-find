<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import CheckCircled from 'svelte-radix/CheckCircled.svelte';
	import Cross2 from 'svelte-radix/Cross2.svelte';
	import CrossCircled from 'svelte-radix/CrossCircled.svelte';
	import InfoCircled from 'svelte-radix/InfoCircled.svelte';
	import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert';
	import { Button } from '$lib/components/ui/button';
	import type { toastData } from '$lib/types/types';

	export let toast: toastData;

	const dispatch = createEventDispatcher<{ dismiss: toastData }>();
	const dismiss = () => dispatch('dismiss', toast);

	onMount(() => {
		const timer = window.setTimeout(dismiss, toast.timeout);
		return () => window.clearTimeout(timer);
	});

	$: isError = toast.type === 'error' || toast.type.startsWith('warning');
</script>

<div in:fly={{ y: 12, duration: 180 }} out:fade={{ duration: 140 }}>
	<Alert
		variant={isError ? 'destructive' : 'default'}
		class="relative w-[min(24rem,calc(100vw-2rem))] border bg-popover/95 pr-11 shadow-2xl backdrop-blur"
	>
		{#if toast.type === 'success'}
			<CheckCircled class="h-4 w-4 text-primary" />
		{:else if isError}
			<CrossCircled class="h-4 w-4" />
		{:else}
			<InfoCircled class="h-4 w-4 text-primary" />
		{/if}
		<AlertTitle>{toast.title}</AlertTitle>
		<AlertDescription class="mt-1 text-muted-foreground">{toast.subtitle}</AlertDescription>
		<Button
			variant="ghost"
			size="icon"
			class="absolute right-1.5 top-1.5 h-8 w-8"
			aria-label="Dismiss notification"
			on:click={dismiss}
		>
			<Cross2 class="h-4 w-4" />
		</Button>
	</Alert>
</div>
