<script>
  import * as d3 from "d3"; 
  import { createScale} from './LineGraphStore.js'
  import { setContext } from 'svelte';
  export let svg
  export let height = 200
  export let width = 500
  export let margin = 30
  export let xextent = false
  export let yextent = false

  let xaxis, yaxis

  let xScale = createScale()
  xScale.setRange([margin,width-margin])
  let yScale = createScale()
  yScale.setRange([height-margin,margin])

  $: x0 = $xScale(0)
  $: y0 = $yScale(0)

  $: xAxis = d3.axisBottom($xScale)
  $: if(xaxis) d3.select(xaxis).call(xAxis)
  $: yAxis = d3.axisLeft($yScale)
  $: if(yaxis) d3.select(yaxis).call(yAxis)

  setContext("constants",{height,margin,xScale,yScale,xextent,yextent})

</script>

<svg height={height} width={width}>
<g class = xaxis bind:this={xaxis} style={"transform:translate(0px,"+y0+"px)"}></g>
<g class = yaxis bind:this={yaxis} style={"transform:translate("+x0+"px,0px)"}></g>
<slot></slot>
</svg>