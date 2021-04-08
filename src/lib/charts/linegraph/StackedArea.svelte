<script>
  import { onDestroy } from 'svelte'
  import * as d3 from 'd3'
  import { getContext } from 'svelte'
  export let id = 'StackedArea' + Math.random()
  export let data = [
    { x: 0, y1: 0.3, y2: 0.7 },
    { x: 1, y1: 0.7, y2: 0.3 }
  ]
  export let xaccessor = d => d.x
  export let xScale
  export let yScale
  export let layers = [
    {
      name: 'y1',
      accessor: d => d.y1,
      style: { fill: 'pink', stroke: 'black', 'fill-opacity': 0.5 }
    },
    {
      name: 'y2',
      accessor: d => d.y2,
      style: { fill: 'pink', stroke: 'black', 'fill-opacity': 0.5 }
    }
  ]
  export let stacked_data

  // let {height,width,margin,xScale,yScale,xextent,yextent} = getContext("constants");
  const constants = getContext('constants')
  $: width = $constants.width
  $: xextent = $constants.xextent
  $: yextent = $constants.yextent

  $: layers.forEach(d => {
    if (typeof d.active === 'undefined') {
      d.active = true
    }
  })

  $: _layers = layers.filter(d => d.active)

  $: if (xextent) {
    xScale.setExtents(id, xextent)
  } else {
    xScale.setExtents(id, data.map(xaccessor))
  }

  let stack = d3.stack()

  $: stackaccessor = (d, key) => _layers[key].accessor(d)
  $: if (width) {
    stacked_data = stack.keys(Object.keys(_layers)).value(stackaccessor)(data)
  }

  $: toplayer = stacked_data[stacked_data.length - 1]

  $: if (yextent) {
    yScale.setExtents(id, yextent)
  } else if (toplayer) {
    yScale.setExtents(
      id,
      toplayer.map(d => d[1])
    )
  }

  let area = d3.area()

  $: {
    area
      .x(d => $xScale(xaccessor(d.data)))
      .y1(d => $yScale(d[1]))
      .y0(d => $yScale(d[0]))
    area = area
  }

  onDestroy(() => {
    xScale.clear(id)
    yScale.clear(id)
  })
</script>

<g>
  {#each stacked_data as a}
    <path d={area(a)} {..._layers[a.key].style} />
  {/each}
</g>
