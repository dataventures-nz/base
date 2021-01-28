<script>
	import { getContext, setContext, onDestroy, onMount } from 'svelte';

	const { getMap } = getContext("map");
	const map = getMap();
	export let name;
	export let type;
	export let url;
	export let options = {};
	let container
	let maploaded=false
	setContext("mapSourceName",name);
	let src = map.addSource(name, {type, url, ...options})
	maploaded=true

  // onMount(() => console.log(`MapSource Mounted ${name}`))
  // onDestroy(() => map.removeSource(name))


</script>

<div bind:this={container}>
	{#if maploaded}
		<slot></slot>
	{/if}
</div>
