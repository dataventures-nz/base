import { writable } from 'svelte/store'
import * as d3 from 'd3'

export function createScale(scale) {
  scale = scale ?? d3.scaleLinear()
  const { subscribe, set, update } = writable(scale)
  let extents = {}

  const recalc = () => {
    const ext = d3.extent(Object.values(extents).flat())
    update(x => x.domain(ext))
  }

  return {
    subscribe,
    set,
    update,
    setRange: range => update(x => x.range(range)),
    setExtents: (key, ext) => {
      extents[key] = ext
      recalc()
    },
    clear: key => {
      if (key) {
        delete extents[key]
      } else {
        extents = {}
      }
      recalc()
    }
  }
}
