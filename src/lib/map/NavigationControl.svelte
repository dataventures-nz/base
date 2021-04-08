<script>
  import { getContext } from 'svelte'
  const mapStore = getContext('mapStore')()
  const map = mapStore.map

  export let options = { showCompass: false }
  export let position = 'top-left'

  map.addControl(new mapboxgl.NavigationControl(options), position)
</script>
