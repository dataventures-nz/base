<script>
	import { onMount, getContext, setContext, onDestroy } from 'svelte';
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();
	const { getMap } = getContext("map");
	const map = getMap();

	export let id;
	export let type;
	export let sourcelayer;
	export let options ={};

  // onMount(() => console.log(`MapLayer Mounted ${id}`))
  //onDestroy(() => map.removeLayer(id))

// layout properties
	export let visible = true;
  let source = getContext("mapSourceName")
  let layer = {id, type, "source-layer":sourcelayer, source, ...options};
  map.addLayer(layer);
  map.setLayoutProperty(id,'visibility', visible?'visible':'none')
  const eventtypes = ['sourcedata','mousedown','mouseup','click','dblclick','mousemove','mouseenter','mouseleave','mouseover','mouseout','contextmenu','touchstart','touchend','touchcancel'];
  eventtypes.forEach(eventtype => {
    map.on(eventtype, id, function(e) {
      dispatch(eventtype,{id,'event':e, 'features':e.features, source, sourcelayer})
    })
  })

  $: if (map.getLayer(id)) { map.setLayoutProperty(id,'visibility', visible?'visible':'none') }
  
</script>

