<script>
	import { onMount, setContext } from 'svelte'
	import { createEventDispatcher } from 'svelte'
  // import mapboxgl from './mapbox-gl.js'

	const dispatch = createEventDispatcher()

	export let lat
	export let lon
	export let zoom
	export let minZoom
	export let style
	export let map
	let container
  let maploaded

	setContext("map", {
    getMap: () => map
  })

	onMount(async () => {
    mapboxgl.accessToken = "pk.eyJ1IjoiZGF0YXZlbnR1cmVzIiwiYSI6ImNqc2MzbXdkbDAxNzI0M3BubGx2OXZwc28ifQ.ZtDrTImrICdc8-TkI6FIfg"
		map = new mapboxgl.Map({
			container,
			center: [lon, lat],
			style,
			zoom,
			minZoom
		})
		map.on("load", () => {maploaded = true})
		dispatch('mapready', {map})
		return () => {
      console.log(map.getStyle())
      // need to record which layers and sources are added.
      // map.eachLayer((layer) => map.removeLayer(layer))
      // map.eachSource((source) => map.removeSource(source))
			map.remove()
		}
	})
</script>

<style>
	div {
		width: 100%;
		height: 100%;
	}
</style>

<div bind:this={container}>
	{#if maploaded}
		<slot></slot>
	{/if}
</div>
