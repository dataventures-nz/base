<script>
  import { onMount, setContext, onDestroy } from 'svelte'
  import { createEventDispatcher } from 'svelte'
  import { createMapStore } from './mapstore.js'
  // import mapboxgl from './mapbox-gl.js'

  const dispatch = createEventDispatcher()

  export let lat
  export let lon
  export let zoom
  export let minZoom
  export let style
  export let map = undefined
  let container
  let maploaded
  export let mapStore
  onDestroy(() => {
    if (map) map.remove()
  })

  setContext('mapStore', () => mapStore)

  onMount(async () => {
    mapboxgl.accessToken =
      'pk.eyJ1IjoiZGF0YXZlbnR1cmVzIiwiYSI6ImNqc2MzbXdkbDAxNzI0M3BubGx2OXZwc28ifQ.ZtDrTImrICdc8-TkI6FIfg'
    mapStore = createMapStore({
      container,
      center: [lon, lat],
      style,
      zoom,
      minZoom
    })
    let map = mapStore.map

    map.on('load', () => {
      maploaded = true
    })
    dispatch('mapready', { map })
    return () => {
      mapStore.removeAll()
    }
  })
</script>

<div bind:this={container}>
  {#if maploaded}
    <slot />
  {/if}
</div>

<style>
  div {
    width: 100%;
    height: 100%;
  }
</style>
