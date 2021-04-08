<script>
  import { onDestroy } from 'svelte'
  import * as d3 from 'd3'
  import { getContext } from 'svelte'
  export let data = [
    { x: 0, y: 0 },
    { x: 1, y: 1 }
  ]
  export let style = undefined
  export let xaccessor = d => d.x
  export let yaccessor = d => d.y
  export let id = Math.random()
  export let xScale
  export let yScale

  const c = getContext('constants')

  $: margin = $c.margin
  $: xextent = $c.xextent
  $: yextent = $c.yextent

  $: if (style == undefined) {
    let stroke = '#' + Math.floor(Math.random() * 0xefffff + 0x100000).toString(16)
    style = { stroke: stroke, fill: 'none' }
  }

  if (xextent) {
    xScale.setExtents(id, xextent)
  } else {
    xScale.setExtents(id, data.map(xaccessor))
  }

  if (yextent) {
    yScale.setExtents(id, yextent)
  } else {
    yScale.setExtents(id, data.map(yaccessor))
  }

  onDestroy(() => {
    xScale.clear(id)
    yScale.clear(id)
  })

  $: line = d3
    .line()
    .x(d => $xScale(xaccessor(d)))
    .y(d => $yScale(yaccessor(d)))
</script>

<g style={'transform:translate(' + margin + ',' + margin + ')'}>
  <path d={line(data)} {...style} />
</g>
