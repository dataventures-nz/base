<script>
  import * as d3 from "d3"; 
  import { createScale} from '../scaleStore.js'
  import { setContext } from 'svelte';
  import { writable } from 'svelte/store';

  export let svg
  export let height = 200
  export let width = 500
  export let margin = {top:30,bottom:30,left:80,right:20}
  export let xextent = false
  export let yextent = false
  export let xtime = false
  export let ytime = false
  export let ysuppressZero = false
  export let intercepts = "zero" // "bottom_left" or [x,y] 

  let xaxis, yaxis, x0,y0
  
  let xScale = xtime ? createScale(d3.scaleTime()) : createScale()
  $: xScale.setRange([margin.left,width-margin.right])
  let yScale = ytime ? createScale(d3.scaleTime()) : createScale()
  yScale.setRange([height-margin.bottom,margin.top])

  $: {
    if (intercepts == "zero"){
        x0 = $xScale(0)
        y0 = $yScale(0)
    } else if (intercepts.length == 2){
        x0 = $xScale(intercepts[0])
        y0 = $yScale(intercepts[1])
    } else {
        x0 = margin.left
        y0 = height-margin.bottom
    } 
  }

  $: if(!ysuppressZero){
     yScale.setExtents("suppressZero",[0])
    } else {yScale.clear("suppressZero")}
  $: xAxis = d3.axisBottom($xScale)
  $: if(xaxis) d3.select(xaxis).call(xAxis)
  $: yAxis = d3.axisLeft($yScale)
  $: if(yaxis) d3.select(yaxis).call(yAxis)

  const constants = writable({height,width,margin,xScale,yScale,xextent,yextent,xtime,ytime})
  $: constants.set({height,width,margin,xScale,yScale,xextent,yextent,xtime,ytime})
  $: setContext("constants",constants)

</script>

<svg height={height} width={width} bind:this={svg}>
  <g class = xaxis bind:this={xaxis} style={"transform:translate(0px,"+y0+"px)"}></g>
  <g class = yaxis bind:this={yaxis} style={"transform:translate("+x0+"px,0px)"}></g>
  <slot></slot>
</svg>