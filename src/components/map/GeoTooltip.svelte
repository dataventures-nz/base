<script>
  import {getContext} from 'svelte';
  const {mapboxgl, getMap} = getContext("map");
  const map = getMap();
  export let countries = 'nz';
  export let zoom = 10;
  export let marker = {color:"#EE6823"};
  export let position = 'bottom-right';

  const accessToken = mapboxgl.accessToken
  var geocoder = new MapboxGeocoder({
    accessToken,
    mapboxgl,
    countries,
    zoom,
    marker
  })
  map.addControl(geocoder,position)
</script>