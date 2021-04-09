<script>
  import * as d3 from 'd3'
  import { setContext } from 'svelte'
  export let svg = undefined
  export let margin = 20
  export let plotRadius = 200
  export let axisTitles = new Array(4).fill('')
  export let axisOffset = 0
  export let arcOptions = {}
  const defaultArcOptions = {
    inner: 0.95 * plotRadius,
    outer: plotRadius,
    offset: 0,
    labels: new Array(4).fill(''),
    fill: ['lightgrey', 'darkgrey'],
    stroke: ['lightgrey', 'darkgrey']
  }
  export let gradient = false
  export let gradientStops = [
    { stop: '0%', color: 'white' },
    { stop: '50%', color: '#EE6823' },
    { stop: '100%', color: 'black' }
  ]
  setContext('polarconstants', { plotRadius, margin, gradient })

  arcOptions = { ...defaultArcOptions, ...arcOptions }

  let rotAngle = 360 / axisTitles.length
  let svgSize = plotRadius + margin

  let arcPath = d3.arc().innerRadius(arcOptions.inner).outerRadius(arcOptions.outer)
  let arcAngle = (2 * Math.PI) / arcOptions.labels.length
  let _arcs = arcOptions.labels.map((d, i) => ({
    startAngle: (i - arcOptions.offset) * arcAngle,
    endAngle: (i + 1 - arcOptions.offset) * arcAngle,
    label: d
  }))
</script>

<svg bind:this={svg} width={2 * (plotRadius + margin)} height={2 * (plotRadius + margin)}>
  {#if gradient}
    <radialGradient id="gradient" gradientUnits="userSpaceOnUse" cx="0" cy="0" r={plotRadius}>
      {#each gradientStops as { stop, color }, i}
        <stop offset={stop} stop-color={color} />
      {/each}
    </radialGradient>
  {/if}
  {#if _arcs}
    {#each _arcs as arc, i}
      <g class="arc" transform={'translate(' + svgSize + ',' + svgSize + ')'}>
        <path d={arcPath(arc)} stroke={arcOptions.stroke[i % 2]} fill={arcOptions.fill[i % 2]} />
      </g>
    {/each}
  {/if}
  {#if axisTitles.length}
    {#each axisTitles as axis, i}
      <g
        class="axis"
        transform={'translate(' + svgSize + ',' + svgSize + ') rotate(' + (180 + (i - axisOffset) * rotAngle) + ')'}
      >
        <line x1="0" y1="0" x2="0" y2={plotRadius} stroke="darkgrey" />
        <text text-anchor="end" transform={'translate(-12,' + 0.98 * plotRadius + ') rotate(90)'}>{axis}</text>
      </g>
    {/each}
  {/if}
  <slot />
</svg>
