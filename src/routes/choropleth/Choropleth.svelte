<script>
  import * as d3 from 'd3'
  import Map from '$lib/map/Map.svelte'
  import MapSource from '$lib/map/MapSource.svelte'
  import MapLayer from '$lib/map/MapLayer.svelte'
  import GeoCoder from '$lib/map/GeoCoder.svelte'
  import NavigationControl from '$lib/map/NavigationControl.svelte'
  export let height = 500
  export let layer
  export let data
  export let accessor = d=>+d.count
  export let matcher
  export let colorScale = d3.scaleLinear(["white","blue"])  

  let mapStore

  matcher = ['match', ['get', layer.map.properties.id]]

  let fill = data.then(d=>{
    let extent = d3.extent(d,accessor)
    colorScale.domain(extent) 
    return d})
  .then(d=> {d.forEach(element => {
      element.color = colorScale(accessor(element))
      matcher.push(element[layer.db.field],element.color)
    })
    console.log(matcher.length)
    matcher.push('rgba(0, 0, 0, 0)')
     let fill = {
      paint:{
        'fill-color':matcher,
        'fill-opacity': 0.8
      }
    }
    return fill})

  const lines = {
    paint: {
      'line-color': '#627BC1',
      'line-width': 0.5,
      'line-opacity': 0.5
    }
  }


let layers,map
$: if(mapStore){
    layers = mapStore.layers
    map = mapStore.map 
  }  

$: if(layers && $layers[0]){
    console.log("features",$layers[0])
    let features = map.queryRenderedFeatures({layers:[$layers[0].layer_id]})
    console.log({feature:features[0]})
    }
$:console.log(colorScale)    

</script>

<div style="height:{height}px">
  <Map
    bind:mapStore
    lat={-41.5}
    lon={172}
    zoom={4.5}
    minZoom={3.5}
    style="mapbox://styles/dataventures/cjzaospfz0i1l1cn3kcuof5ix"
  >
      <MapSource name={layer.map.name} type="vector" url={layer.map.url}>
        {#await fill} 
          <MapLayer
            id={layer.map.name + '-lines'}
            type="line"
            sourcelayer={layer.map.sourcelayer}
            options={lines}
          />
        {:then f}
          {console.log("html",f)}
          <MapLayer
            id={layer.map.name + '-fill'}
            type="fill"
            sourcelayer={layer.map.sourcelayer}
            options={f}
          />
          <MapLayer
            id={layer.map.name + '-lines2'}
            type="line"
            sourcelayer={layer.map.sourcelayer}
            options={lines}
          />
        {/await}
      </MapSource>
    <GeoCoder />
    <NavigationControl />
  </Map>
</div>
