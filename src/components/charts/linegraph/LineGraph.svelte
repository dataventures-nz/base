<script>
  import * as d3 from "d3"; 
  import { createScale} from '../scaleStore.js'
  import { setContext } from 'svelte';
  export let svg
  export let height = 200
  export let width = 500
  export let margin = 30
  export let xextent = false
  export let yextent = false
  export let xtime = false
  export let ytime = false
  export let ysuppressZero = false
  export let intercepts = "zero" // "bottom_left" or [x,y] 

  let xaxis, yaxis, x0,y0
  
  let xScale = xtime ? createScale(d3.scaleTime()) : createScale()
  xScale.setRange([margin,width-margin])
  let yScale = ytime ? createScale(d3.scaleTime()) : createScale()
  yScale.setRange([height-margin,margin])

  $: {
    if (intercepts == "zero"){
        x0 = $xScale(0)
        y0 = $yScale(0)
    } else if (intercepts.length == 2){
        x0 = $xScale(intercepts[0])
        y0 = $yScale(intercepts[1])
    } else {
        x0 = margin
        y0 = height-margin
    } 
  }

  $: if(!ysuppressZero){
     yScale.setExtents("suppressZero",[0])
    } else {yScale.clear("suppressZero")}
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