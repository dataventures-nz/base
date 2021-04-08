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
  export let gap = 0 //width of gap in px
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

  const constants = getContext('constants')
  $: width = $constants.width
  $: margin = $constants.margin
  $: yextent = $constants.yextent

  $: layers.forEach(d => {
    if (typeof d.active === 'undefined') {
      d.active = true
    }
  })

  $: _layers = layers.filter(d => d.active)
  $: w = Math.max((width - (margin.left + margin.right)) / (1 + data.length) - gap, 1)

  let xextent
  $: {
    let xe = d3.extent(data.map(xaccessor))
    let xd = (xe[1] - xe[0]) / data.length
    xextent = [xe[0].getTime() - xd / 2, xe[1].getTime() + xd / 2]
    if ($constants.xtime) {
      xextent = xextent.map(d => new Date(d))
    }
  }

  $: xScale.setExtents(id, xextent)

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

  onDestroy(() => {
    xScale.clear(id)
    yScale.clear(id)
  })
</script>

<g>
  <!-- <g style = {"transform:translate("+margin+","+margin+")"}> -->

  {#each stacked_data as point}
    {#each point as r}
      <rect
        width={w}
        height={$yScale(r[0]) - $yScale(r[1])}
        y={$yScale(r[1])}
        x={$xScale(xaccessor(r.data)) - w / 2}
        {..._layers[point.key].style}
      />
    {/each}
  {/each}
</g>
