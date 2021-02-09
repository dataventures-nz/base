<script>
	import { tick, getContext, setContext, onDestroy, onMount } from 'svelte';

	const { getMap } = getContext("map");
	const map = getMap();
	export let name;
	export let type;
	export let url;
	export let options = {};
	let container
	let maploaded=false
	let destroying = false	
	if (!map.getSource(name)){
		setContext("mapSourceName",name);
		map.addSource(name, {type, url, ...options})
		maploaded=true
	}

  // onMount(() => console.log(`MapSource Mounted ${name}`))
   onDestroy(async () => {destroying=true; await tick(); map.removeSource(name)})

</script>

<div bind:this={container}>
	{#if maploaded && !destroying}
		<slot></slot>
	{/if}
</div>
