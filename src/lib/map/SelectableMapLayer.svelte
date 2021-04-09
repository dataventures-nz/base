<script>
  import MapLayer from '$lib/map/MapLayer.svelte'
  import _ from 'lodash'
  import { getContext } from 'svelte'
  import { single_only } from '$lib/map/select_modes.js'
  export let id = ''
  export let type = 'fill'
  export let sourcelayer = ''
  export let options = {}
  export let selected = []
  export let visible = true
  export let selectMode = single_only
  export let id_accessor = undefined //id_accessor gets id off feature?
  export let reverse_accessor = undefined
  const mapStore = getContext('mapStore')()
  const map = mapStore.map

  var source = getContext('source_id')

  // selection stuff
  let selectedOnMap = []

  // stuff the map has selected which the base selection doesn't have
  const onlyMapSelected = () => {
    return _.without(selectedOnMap, ...selected)
  }

  // stuff the baseSelection has the map doesn't
  const notMapSelected = () => _.without(selected, ...selectedOnMap)

  const sync = s => {
    const removing = onlyMapSelected()
    const adding = notMapSelected()

    map
      .querySourceFeatures(source, { sourceLayer: sourcelayer })
      .map(f => map.setFeatureState({ source, sourceLayer: sourcelayer, id: f.id }, { selected: false }))

    removing
      .map(x => findFor(x))
      .flat()
      .map(function (feature) {
        if (feature) {
          map.setFeatureState(feature, { selected: false })
        }
      })
    adding
      .map(x => findFor(x))
      .flat()
      .map(function (feature) {
        if (feature) {
          map.setFeatureState(feature, { selected: true })
        }
      })
    selected
      .map(x => findFor(x))
      .flat()
      .map(function (feature) {
        if (feature) {
          map.setFeatureState(feature, { selected: true })
        }
      })
    selectedOnMap = s
  }

  $: sync(selected)

  const filters = f => _.toPairs(f).map(e => ['in', e[0], e[1]])

  function findFor(x) {
    let filter = ['all', ...filters(reverse_accessor(x))]
    let found = map
      .querySourceFeatures(source, {
        sourceLayer: sourcelayer,
        filter
      })
      .map(x => {
        return { sourceLayer: sourcelayer, source, ...x }
      })
    return found
  }

  let popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false
  })

  const mousemoveHandler = function (e) {
    if (e.detail.features.length > 0) {
      let coordinates = e.detail.event.lngLat
      const feature = id_accessor(e.detail.features[0])
      if (feature.id) {
        const name = feature.name
        const number = feature.area_id
        const tooltip = '<p>' + name + '</p><p>[' + number + ']</p>'
        popup.setLngLat(coordinates).setHTML(tooltip).addTo(map)
      }
    }
  }

  const mouseleaveHandler = () => {
    popup.remove()
  }

  const mouseclickHandler = e => {
    const mutator = selectMode.selectMutator(id_accessor, e)
    selected = mutator(selected)
  }
</script>

<MapLayer
  {id}
  {type}
  {sourcelayer}
  {options}
  {visible}
  on:sourcedata={() => {
    selectedOnMap = []
    sync(selected)
  }}
  on:click={mouseclickHandler}
  on:mousemove={mousemoveHandler}
  on:mouseleave={mouseleaveHandler}
/>

<style>
  :global(div.mapboxgl-popup-content) {
    display: flex;
    flex-direction: column;
    align-items: center;
    font-weight: bold;
    min-width: 100px;
  }

  :global(div.mapboxgl-popup-content p) {
    margin: 3px 0px 3px 0px;
  }
</style>
