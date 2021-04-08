<script>
  import * as d3 from 'd3'
  import { getContext } from 'svelte'
  export let data
  export let thetaMax = false
  export let rMax = false
  export let str = undefined
  export let fill = 'none'

  $: if (str == undefined) {
    str = '#' + Math.floor(Math.random() * 16777215).toString(16)
  }

  const { plotRadius, margin, gradient } = getContext('polarconstants')

  let thetaScale = d3
    .scaleLinear()
    .domain([0, thetaMax ? thetaMax : d3.max(data, d => d.theta)])
    .range([0, 2 * Math.PI])
  let rScale = d3
    .scaleLinear()
    .domain([0, rMax ? rMax : d3.max(data, d => d.r)])
    .range([0, plotRadius])
  let line = d3
    .lineRadial()
    .angle(d => thetaScale(d.theta))
    .radius(d => rScale(d.r))
  let svgSize = plotRadius + margin
</script>

<g transform={'translate(' + svgSize + ',' + svgSize + ')'}>
  {#if gradient}
    <path d={line(data)} style="fill:none;stroke:url(#gradient)" />
  {:else}
    <path d={line(data)} style={'fill:' + fill + ';stroke:' + str} />
  {/if}
</g>
