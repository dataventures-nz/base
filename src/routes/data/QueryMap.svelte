<script>
  import Map from '$lib/map/Map.svelte'
  import MapSource from '$lib/map/MapSource.svelte'
  import MapLayer from '$lib/map/MapLayer.svelte'
  import GeoCoder from '$lib/map/GeoCoder.svelte'
  import SelectableMapLayer from '$lib/map/SelectableMapLayer.svelte'
  import { ctrl_click_adds } from '$lib/map/select_modes.js'
  import NavigationControl from '$lib/map/NavigationControl.svelte'
  export let selectMode = ctrl_click_adds
  export let height = 500
  export let layerlist = []
  export let currentlayer
  export let selection

  let map


  const fill = {
    paint: {
      'fill-color': ['coalesce', ['feature-state', 'color'], '#627BC1'],
      'fill-opacity': [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        0.7,
        ['boolean', ['feature-state', 'selected'], false],
        0.7,
        0
      ]
    }
  }

  const lines = {
    paint: {
      'line-color': {
        'stops':[
          [10,'#627BC1'],
          [15,'#F65A00']
        ]
      },
      'line-opacity':{
        'stops': [
          [3.5, 0.4],
          [20, 1]
        ]
      },
      'line-width':{
        'stops': [
          [3.5, 0.4],
          [10,0.5],
          [20, 4]
        ]
      }
    }
  }


  function accessor_for(map) {
    let p = map.properties
    return feature => {
      return {
        id: feature.id,
        area_id: feature.properties[p.id],
        name: feature.properties[p.name]
      }
    }
  }

  function reverse_accessor_for(map) {
    let p = map.properties
    function reverse_accessor(d) {
      return { [p.id]: d.area_id }
    }
    return reverse_accessor
  }

  $: {
    layerlist.map(d => (d.ui.visible = false))
    layerlist[currentlayer] && (layerlist[currentlayer].ui.visible = true)
  }

  $: console.log(map)

</script>
<div style="height:{height}px">
  <Map
    bind:mapStore={map}
    lat={-41.5}
    lon={172}
    zoom={4.5}
    minZoom={3.5}
    style="mapbox://styles/dataventures/cjzaospfz0i1l1cn3kcuof5ix"
    logZoom = {false}
  >
    {#each layerlist as layer (layer.map.name)}
      <MapSource name={layer.map.name} type="vector" url={layer.map.url}>
        <SelectableMapLayer
          bind:visible={layer.ui.visible}
          id={layer.map.name + '-fill'}
          type="fill"
          {selectMode}
          sourcelayer={layer.map.sourcelayer}
          options={fill}
          id_accessor={accessor_for(layer.map)}
          reverse_accessor={reverse_accessor_for(layer.map)}
          bind:selected={selection}
        />
        <MapLayer
          bind:visible={layer.ui.visible}
          id={layer.map.name + '-lines'}
          type="line"
          sourcelayer={layer.map.sourcelayer}
          options={lines}
        />
      </MapSource>
    {/each}
    <GeoCoder />
    <NavigationControl />
  </Map>
</div>
