<script>
  import {getContext} from 'svelte'
  const {getMap} = getContext("map")
  const map = getMap()

  export let options = {"showCompass":false}
  export let position = 'top-left'
  
  map.addControl(new mapboxgl.NavigationControl(options), position);

</script>