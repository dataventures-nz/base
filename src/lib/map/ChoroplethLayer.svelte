<script>
  import { getContext, onDestroy } from 'svelte'
  import { createEventDispatcher } from 'svelte'
  const mapStore = getContext('mapStore')()
  const map = mapStore.map
  const dispatch = createEventDispatcher()

  export let id
  export let type
  export let sourcelayer
  export let options = {}
  export let visible = true
  onDestroy(() => {
    mapStore.removeLayer(id)
  })
  let source_id = getContext('source_id')
  mapStore.addLayer(source_id, id, type, sourcelayer, options)

  const eventtypes = [
    'sourcedata',
    'mousedown',
    'mouseup',
    'click',
    'dblclick',
    'mousemove',
    'mouseenter',
    'mouseleave',
    'mouseover',
    'mouseout',
    'contextmenu',
    'touchstart',
    'touchend',
    'touchcancel'
  ]
  eventtypes.forEach(eventtype => {
    map.on(eventtype, id, function (e) {
      dispatch(eventtype, { id, event: e, features: e.features, source: source_id, sourcelayer })
    })
  })

  $: if (map.getLayer(id)) {
    map.setLayoutProperty(id, 'visibility', visible ? 'visible' : 'none')
  }
</script>
