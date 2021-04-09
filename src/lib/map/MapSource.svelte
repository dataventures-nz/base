<script>
  import { getContext, setContext, onDestroy } from 'svelte'

  const mapStore = getContext('mapStore')()
  export let name
  export let type
  export let url
  export let options = {}
  mapStore.addSource(name, type, url, options)
  setContext('source_id', name)
  onDestroy(() => mapStore.removeSource(name))
</script>

<slot />
