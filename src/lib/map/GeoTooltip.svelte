<script>
  import { getContext } from 'svelte'
  export let countries = 'nz'
  export let zoom = 10
  export let marker = { color: '#EE6823' }
  export let position = 'bottom-right'

  const mapStore = getContext('mapStore')()
  const map = mapStore.map

  const accessToken = mapboxgl.accessToken
  var geocoder = new MapboxGeocoder({
    accessToken,
    mapboxgl,
    countries,
    zoom,
    marker
  })
  map.addControl(geocoder, position)
</script>
