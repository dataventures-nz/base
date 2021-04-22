import { get, writable } from 'svelte/store'

export let createMapStore = mapOptions => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoiZGF0YXZlbnR1cmVzIiwiYSI6ImNqc2MzbXdkbDAxNzI0M3BubGx2OXZwc28ifQ.ZtDrTImrICdc8-TkI6FIfg'

  let map = new mapboxgl.Map(mapOptions)
  let layers = writable([])
  let sources = writable([])

  const removeSource = source_id => {
    const ls = [...get(layers)]
    ls.filter(layer => layer.source_id == source_id).forEach(layer => map.removeLayer(layer.layer_id))
    layers.set(ls.filter(layer => layer.source_id != source_id))
    sources.set(get(sources).filter(source => source.source_id != source_id))
  }

  const removeLayer = layer_id => {

    const ls = [...get(layers)]
    ls.filter(layer => layer.layer_id == layer_id).forEach(layer => map.removeLayer(layer.layer_id))
    layers.set(ls.filter(layer => layer.layer_id != layer_id))
  }

  const addSource = (source_id, type, url, options) => {
    if (get(sources).includes(source_id)) {
      return
    }
    map.addSource(source_id, { type, url, ...options })
    sources.set([...get(sources), source_id])
  }

  const addLayer = (source_id, layer_id, type, source_layer, options) => {
    let layer = { id: layer_id, type, 'source-layer': source_layer, source: source_id, ...options }
    map.addLayer(layer)
    layers.set([...get(layers),{ layer_id, source_id }])
  }

  const removeAll = () => {
    [...get(sources)].forEach(source => removeSource(source.source_id))
    map.remove()
  }

  return {
    removeSource,
    removeLayer,
    addSource,
    addLayer,
    removeAll,
    layers,
    sources,
    map
  }
}
