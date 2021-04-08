<script>
  import { getContext } from 'svelte'
  // import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
  // import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
  const mapStore = getContext('mapStore')()

  const map = mapStore.map
  import access from './mapbox.json'
  export let countries = 'nz'
  export let zoom = 10
  export let marker = { color: '#EE6823' }
  export let position = 'bottom-right'

  // const accessToken = mapboxgl.accessToken
  var geocoder = new MapboxGeocoder({
    accessToken: access.accessToken,
    mapboxgl,
    countries,
    zoom,
    marker
  })
  map.addControl(geocoder, position)
</script>
