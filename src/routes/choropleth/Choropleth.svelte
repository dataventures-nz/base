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
  export let accessor = d=> + d.count
  export let colorScale = ()=>"black"
  export let imposedDomain = undefined
  
  let mapStore
  let fill
  $: console.log({imposedDomain})

  $: data.then(d=> {
        const ext = imposedDomain ? imposedDomain : d3.extent(d,accessor)
        if (JSON.stringify(colorScale?.domain()) == JSON.stringify(ext)) {
          return 
        }
      colorScale = colorScale?.domain(ext)
      console.log({ext})
  })

  $: 
    fill = data.then(d=> {
      let matcher = ['match', ['get', layer.map.properties.id]]
      d.forEach(element => {
        element.color = colorScale(accessor(element))
        matcher.push(element[layer.db.field],element.color)
      })
      matcher.push('rgba(0, 0, 0, 0)')
      let f = {
        paint:{
          'fill-color':matcher,
          'fill-opacity': 0.8
        }
      }
      return f
    })
  

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

</script>

<div style="height:{height}px">
  <Map
    bind:mapStore
    lat={-41.5}
    lon={172}
    zoom={5}
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
