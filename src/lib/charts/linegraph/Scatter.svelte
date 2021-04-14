<script>
  import { onDestroy } from 'svelte'
  import { getContext } from 'svelte'
  export let id = 'Scatter' + Math.random()
  export let data = [
    { x: 0, y1: 0.3, y2: 0.7 },
    { x: 1, y1: 0.7, y2: 0.3 },
    { x: 2, y1: 0.5, y2: 0.4 }
  ]
  export let xaccessor = d => d.x
  export let layers = [
    {
      name: 'y1',
      accessor: d => d.y1,
      style: { fill: 'pink', stroke: 'red', 'fill-opacity': 1 },
      active: true
    },
    {
      name: 'y2',
      accessor: d => d.y2,
      style: { fill: 'lightgreen', stroke: 'green', 'fill-opacity': 1 }
    }
  ]

  export let xScale
  export let yScale

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

  let internalYextent
  $: internalYextent = _layers.flatMap(l => data.map(l.accessor))

  $: if (yextent) {
    yScale.setExtents(id, yextent)
  } else if (internalYextent) {
    yScale.setExtents(id, internalYextent)
  }

  onDestroy(() => {
    xScale.clear(id)
    yScale.clear(id)
  })
</script>

<g>
  {#each data as point}
    {#each _layers as layer}
      <slot y={$yScale(layer.accessor(point))} x={$xScale(xaccessor(point))} {point}>
        <circle r="5" cy={$yScale(layer.accessor(point))} cx={$xScale(xaccessor(point))} {...layer.style} />
      </slot>
    {/each}
  {/each}
</g>
